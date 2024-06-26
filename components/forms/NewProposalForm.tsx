'use client';
import React, { useState } from 'react';
import type { ProjectTemplate, ServiceTicket } from '@/types/manage';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LabeledInput from '../ui/labeled-input';

type Props = {
	templates: ProjectTemplate[];
	tickets: ServiceTicket[];
};

const NewProposalForm = ({ templates, tickets }: Props) => {
	const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | undefined>();

	return (
		<div className='grid gap-4'>
			<LabeledInput
				name='service_ticket'
				label='Service Ticket'
				required
			>
				<Select
					name='service_ticket'
					onValueChange={(e) => {
						setSelectedTicket(tickets.find((ticket) => ticket.id.toString() === e));
					}}
				>
					<SelectTrigger
						className='col-span-3 overflow-hidden'
						tabIndex={2}
					>
						<SelectValue
							placeholder='Select a ticket'
							defaultValue={String(selectedTicket?.id)}
						/>
					</SelectTrigger>

					<SelectContent>
						{tickets.map((ticket) => (
							<SelectItem
								key={ticket.id}
								value={String(ticket.id)}
							>
								#{ticket.id} - {ticket.summary}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</LabeledInput>

			<LabeledInput
				name='name'
				label='Name'
				placeholder='Name'
				defaultValue={selectedTicket ? `#${selectedTicket.id} - ${selectedTicket.summary}` : ''}
				tabIndex={1}
				required
			/>

			<LabeledInput
				name='project_templates'
				label='Project Template'
			>
				<Select name='templates_used'>
					<SelectTrigger tabIndex={3}>
						<SelectValue placeholder='Select a template' />
					</SelectTrigger>

					<SelectContent>
						<SelectGroup>
							{templates.map((template) => (
								<SelectItem
									key={template.id}
									value={String(template.id)}
								>
									{template.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</LabeledInput>
		</div>
	);
};

export default NewProposalForm;
