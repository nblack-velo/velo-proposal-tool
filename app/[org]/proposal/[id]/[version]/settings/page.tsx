import SubmitButton from '@/components/SubmitButton';
import TicketSelector from '@/components/TicketSelector';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteProposal } from '@/lib/functions/delete';
import { getOrganization, getProposal, getTicket, getTickets } from '@/lib/functions/read';
import { updateProposal } from '@/lib/functions/update';
import { redirect } from 'next/navigation';
import React from 'react';
import { statuses } from '../products/data/data';
import { Label } from '@/components/ui/label';

const ProposalSettingsPage = async ({ params }: { params: { id: string; version: string } }) => {
	const proposal = await getProposal(params.id);
	const organization = await getOrganization();
	const tickets = await getTickets();

	const ticket = await getTicket(proposal?.service_ticket ?? 0);

	if (!proposal || !ticket) return <div></div>;

	return (
		<div className='grid grid-cols-2 gap-4'>
			<Card>
				<form
					action={async (data: FormData) => {
						'use server';
						await updateProposal(proposal.id, {
							name: data.get('name') as string,
							status: data.get('status') as StatusEnum,
						});
					}}
					className='flex flex-col h-full'
				>
					<CardHeader>
						<CardTitle>General Settings</CardTitle>
						<CardDescription>
							{/* Used to identify your Project on the Dashboard, Vercel CLI, and in the URL of your Deployments. */}
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='grid gap-1'>
							<Label htmlFor='name'>Name</Label>
							<Input
								required
								name='name'
								defaultValue={proposal.name}
							/>
						</div>
						<div className='grid gap-1'>
							<Label htmlFor='status'>Status</Label>
							<Select
								defaultValue={proposal.status}
								name='status'
							>
								<SelectTrigger>
									<SelectValue placeholder='Select a status' />
								</SelectTrigger>
								<SelectContent>
									{statuses.map((status) => (
										<SelectItem
											value={status.value}
											key={status.value}
										>
											{status.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
					<CardFooter className='mt-auto'>
						<SubmitButton className='ml-auto'>Save</SubmitButton>
					</CardFooter>
				</form>
			</Card>

			<Card>
				<form>
					<CardHeader>
						<CardTitle>Service Ticket</CardTitle>
						<CardDescription>The ticket that the proposal was made for.</CardDescription>
					</CardHeader>
					<CardContent className='grid grid-cols-2 gap-4'>
						<div className='grid grid-cols-5 items-center gap-2 col-span-2'>
							<h3 className='text-sm text-muted-foreground'>Ticket</h3>
							<div className='col-span-4'>
								<TicketSelector
									tickets={tickets ?? []}
									ticket={proposal.service_ticket}
								/>
							</div>
						</div>
						<div className='grid gap-2 col-span-2'>
							<h3 className='text-sm text-muted-foreground'>Summary</h3>
							<p className='font-medium'>{ticket?.summary}</p>
						</div>

						<div className='grid gap-2'>
							<h3 className='text-sm text-muted-foreground'>Company</h3>
							<p className='font-medium'>{ticket.company?.name ?? ''}</p>
						</div>
						<div className='grid gap-2'>
							<h3 className='text-sm text-muted-foreground'>Contact</h3>
							<p className='font-medium'>{ticket.contact?.name ?? ''}</p>
						</div>
					</CardContent>
					<CardFooter>
						<SubmitButton
							className='ml-auto'
							disabled={true}
						>
							Save
						</SubmitButton>
					</CardFooter>
				</form>
			</Card>

			<Card className='col-span-2'>
				<form>
					<CardHeader>
						<CardTitle>Delete Proposal</CardTitle>
						<CardDescription>
							The proposal will be permanently deleted, including its deployments and domains. This action is
							irreversible and can not be undone.
						</CardDescription>
					</CardHeader>
					{/* <CardContent></CardContent> */}
					<CardFooter className='bg-red-100'>
						<SubmitButton
							formAction={async () => {
								'use server';
								await deleteProposal(proposal.id);
								redirect(`/${organization?.slug}`);
							}}
							variant='destructive'
							className='ml-auto mt-3 -mb-3'
						>
							Delete
						</SubmitButton>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default ProposalSettingsPage;
