import React from 'react';
import Navbar, { Tab } from '@/components/Navbar';
import { getProposal, getTicket, getVersions } from '@/lib/functions/read';
import { getCurrencyString } from '@/utils/money';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import ProposalActions from './(proposal_id)/proposal-actions';
import { ProposalShare } from './(proposal_id)/proposal-share';
import { calculateTotals } from '@/utils/helpers';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
	params: { org: string; id: string; version: string };
	children: React.ReactNode;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
	const { id, version } = params;
	const proposal = await getProposal(id, version);
	return {
		title: proposal?.name,
	};
}

const ProposalIdLayout = async ({ params, children }: Props) => {
	const { id, org, version } = params;
	const proposal = await getProposal(id, version);

	if (!proposal) return notFound();

	const versions = await getVersions(proposal.id);

	const tabs: Tab[] = [
		{ name: 'Overview', href: `/${org}/proposal/${id}/${version}` },
		{ name: 'Workplan', href: `/${org}/proposal/${id}/${version}/workplan` },
		{ name: 'Products', href: `/${org}/proposal/${id}/${version}/products` },
		{ name: 'Settings', href: `/${org}/proposal/${id}/${version}/settings` },
	];

	const serviceTicket = await getTicket(proposal.service_ticket ?? 0);

	if (!serviceTicket) {
		notFound();
	}

	// console.log(proposal.working_version);

	const { laborTotal, productTotal, recurringTotal, totalPrice } = calculateTotals(
		proposal.working_version.products,
		proposal.working_version.phases,
		proposal.labor_rate
	);

	// console.log(proposal.versions);

	return (
		<>
			<Navbar
				org={org}
				title={proposal?.name}
				titleId={id}
				version={proposal.versions.length > 1 && proposal.working_version.number ? proposal.working_version.number : undefined}
				tabs={tabs}
			>
				<HoverCard>
					<HoverCardTrigger asChild>
						<Button variant='link' className='text-sm font-medium'>
							<span>
								Total: <span className='text-muted-foreground'>{getCurrencyString(totalPrice)}</span>
							</span>
						</Button>
					</HoverCardTrigger>

					<HoverCardContent className='w-80'>
						<div className='grid gap-4'>
							<div className='space-y-2'>
								<h4 className='font-medium leading-none'>Totals</h4>
								<p className='text-sm text-muted-foreground'>See the totals of the different aspects of the proposal.</p>
							</div>

							<div className='grid gap-3'>
								<div className='grid grid-cols-3 items-center gap-4'>
									<Label>Labor</Label>
									<p className='col-span-2 text-sm'>{getCurrencyString(laborTotal)}</p>
								</div>

								<div className='grid grid-cols-3 items-center gap-4'>
									<Label>Product</Label>
									<p className='col-span-2 text-sm'>{getCurrencyString(productTotal)}</p>
								</div>

								<div className='grid grid-cols-3 items-center gap-4'>
									<Label>Recurring</Label>
									<p className='col-span-2 text-sm'>{getCurrencyString(recurringTotal)}</p>
								</div>
							</div>
						</div>
					</HoverCardContent>

					<ProposalShare proposalId={proposal.id} versionId={version} />

					<ProposalActions
						proposal={proposal}
						phases={proposal.phases ?? []}
						tickets={proposal.working_version?.phases?.map((p) => p.tickets ?? [])?.flat() ?? []}
						ticket={serviceTicket}
						versions={versions}
						params={params}
					/>
				</HoverCard>
			</Navbar>

			<div className='min-h-header light:bg-muted/50 flex flex-col'>{children}</div>
		</>
	);
};

export default ProposalIdLayout;
