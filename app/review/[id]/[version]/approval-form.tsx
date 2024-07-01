'use client';
import React from 'react';
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateProposal } from '@/lib/functions/update';
import SubmitButton from '@/components/SubmitButton';
import { Button } from '@/components/ui/button';
import LabeledInput from '@/components/ui/labeled-input';

type Props = {
	proposal: NestedProposal;
};

const ApprovalForm = ({ proposal }: Props) => {
	return (
		<form
			action={async (data: FormData) => {
				await updateProposal(proposal.id, {
					status: 'signed',
					approval_info: {
						po: data.get('po') as string,
						name: data.get('name') as string,
						initials: data.get('initials') as string,
						dateSigned: new Date().toISOString(),
					},
				});
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Approval Proposal</DialogTitle>
				</DialogHeader>

				<div className='grid w-full items-center gap-4'>
					<div className='flex flex-col space-y-1.5'>
						<LabeledInput
							label='Name'
							name='name'
							required
							placeholder='John Doe'
						/>
					</div>

					<div className='flex flex-col space-y-1.5'>
						<LabeledInput
							label='Initals'
							name='initals'
							required
							placeholder='JD'
						/>
					</div>

					<div className='flex flex-col space-y-1.5'>
						<LabeledInput
							label='PO Number (optional)'
							name='po'
							placeholder='123-45678'
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant={'secondary'}>Cancel</Button>
					</DialogClose>
					<SubmitButton>Sign</SubmitButton>
				</DialogFooter>
			</DialogContent>
		</form>
	);
};

export default ApprovalForm;
