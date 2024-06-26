'use client';
import React, { useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import TemplateCatalog from '@/components/TemplateCatalog';
import { ProjectTemplate } from '@/types/manage';
import { v4 as uuid } from 'uuid';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { PhaseState } from '@/types/optimisticTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import PhaseListItem from './PhaseListItem';
import invariant from 'tiny-invariant';
import { updatePhase, updateTicket } from '@/lib/functions/update';
import { createPhase, newTemplate } from '@/lib/functions/create';
import { createNestedPhaseFromTemplate } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { reorder } from '@/utils/array';
import { cn, getBackgroundColor } from '@/lib/utils';

type Props = {
	id: string;
	phases: NestedPhase[];
	templates: ProjectTemplate[];
	version: string;
};

const ProposalBuilder = ({ id, phases, templates, version }: Props) => {
	const [isPending, startTransition] = useTransition();

	function getColor(isDraggedOver: boolean): string {
		if (isDraggedOver) {
			return 'bg-accent/75';
		}
		return 'bg-background';
	}

	const [state, mutate] = useOptimistic({ phases, pending: false }, function createReducer(state, newState: PhaseState) {
		if (newState.newPhase) {
			return {
				phases: [...state.phases, newState.newPhase] as NestedPhase[],
				pending: newState.pending,
			};
		} else if (newState.newPhases) {
			return {
				phases: newState.newPhases as NestedPhase[],
				pending: newState.pending,
			};
		} else if (newState.updatedPhase) {
			return {
				phases: [...state.phases.filter((f) => f.id !== newState.updatedPhase!.id), newState.updatedPhase] as NestedPhase[],
				pending: newState.pending,
			};
		} else if (newState.updatedPhases) {
			return {
				phases: newState.updatedPhases,
				pending: newState.pending,
			};
		} else {
			return {
				phases: [...state.phases.filter((f) => f.id !== newState.deletedPhase)] as NestedPhase[],
				pending: newState.pending,
			};
		}
	});

	const phaseStub: NestedPhase = {
		description: 'New Phase',
		hours: 0,
		order: state.phases?.length ?? 1,
		id: uuid(),
		tickets: [],
		visible: true,
		version,
		reference_id: null,
	};

	const handleTemplateDrop = (templateIndex: number, destinationIndex: number) => {
		const template = templates[templateIndex];

		if (!template || !template.workplan) return;

		const { workplan } = template;

		const createdPhases = createNestedPhaseFromTemplate(workplan, version, destinationIndex);
		const slicedPhases = [...state.phases.slice(destinationIndex)];
		slicedPhases.forEach((phase, index) => (phase.order = createdPhases.length + destinationIndex + index + 1));

		const newPhases = [...state.phases.slice(0, destinationIndex), ...createdPhases, ...slicedPhases];

		startTransition(async () => {
			mutate({
				newPhases,
				pending: true,
			});

			await newTemplate(template, destinationIndex ?? 0, version);
			await Promise.all(slicedPhases.map((phase) => updatePhase(phase.id, { order: phase.order })));
		});
	};

	async function onDragEnd(result: DropResult) {
		const { destination, source } = result;

		// handle dropping a template onto proposal
		if (!destination) return;

		// if dropped on the same list and has same index then do nothing
		if (source.droppableId === destination?.droppableId && source.index === destination?.index) return;

		// handle dropping a template onto proposal
		if (destination?.droppableId === 'phases' && source.droppableId === 'templates') {
			console.log(source, destination);
			handleTemplateDrop(source.index, destination.index);
			return;
		}

		// handle reording tickets
		if (destination?.droppableId === 'tickets' && source.droppableId === 'tickets') {
			// parse phase index from result type
			const index = parseInt(result.type.split('_')[0]);

			const phase = state.phases[index];
			const tickets = reorder(phase.tickets!, destination.index, source.index);
			const updatedPhase = { ...phase, tickets } as NestedPhase;

			startTransition(async () => {
				mutate({ updatedPhase, pending: true });
				// @ts-ignore
				await Promise.all(tickets.map((ticket) => updateTicket(ticket.id, { order: ticket.order })));
			});
			return;
		}

		const updatedPhases = reorder(state.phases, source.index, destination.index);

		startTransition(async () => {
			mutate({ updatedPhases, pending: true });
			await Promise.all(updatedPhases.map((phase) => updatePhase(phase.id, { order: phase.order })));
		});
	}

	const action = () => {
		const newPhase = { ...phaseStub, description: 'New Phase', order: state.phases.length };

		startTransition(async () => {
			mutate({ newPhase, pending: true });
			//@ts-ignore
			delete newPhase['id'];
			delete newPhase['tickets'];
			await createPhase(newPhase, []);
		});
	};

	let sortedPhases = state.phases?.sort((a, b) => {
		// First, compare by score in descending order
		if (Number(a.order) > Number(b.order)) return 1;
		if (Number(a.order) < Number(b.order)) return -1;

		// If scores are equal, then sort by created_at in ascending order
		return Number(a.id) - Number(b.id);
		// return new Date(a.=).getTime() - new Date(b.created_at).getTime();
	});

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className='grid grid-cols-[288px_1fr]'>
				<div className='border-r relative'>
					<TemplateCatalog templates={templates ?? []} />
				</div>

				<ScrollArea className='h-header'>
					<div className='flex flex-col flex-grow my-8 mx-2 relative'>
						<div className='w-full px-2 flex justify-between items-center'>
							<h1 className='text-2xl font-semibold'>Workplan</h1>

							<form action={action}>
								<Button size='sm' variant='secondary'>
									<PlusCircledIcon className='w-4 h-4 mr-2' /> Add Phase
								</Button>
							</form>
						</div>

						<div className='w-full'>
							<Droppable droppableId='phases' type='group'>
								{(provided, snapshot) => (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className={cn('space-y-4 px-2 py-4 flex flex-col rounded-xl h-full min-h-halfScreen', getBackgroundColor(snapshot))}
									>
										{sortedPhases.map((phase, index) => (
											<Draggable key={phase.id} draggableId={phase.id} index={index}>
												{(provided) => (
													<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
														<PhaseListItem
															order={index + 1}
															pending={state.pending}
															phase={phase}
															phaseMutation={mutate}
															tickets={phase?.tickets ?? []}
														/>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</div>
					</div>
				</ScrollArea>
			</div>
		</DragDropContext>
	);
};

export default ProposalBuilder;
