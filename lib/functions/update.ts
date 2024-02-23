'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidateTag } from 'next/cache';

export const updateProduct = async (id: string, product: ProductUpdate) => {
	const supabase = createClient();
	const { error } = await supabase.from('products').update(product).eq('id', id);

	if (error) {
		console.error(error);
		return;
	}

	revalidateTag('proposals');
	revalidateTag('products');
};

export const updateProposal = async (id: string, proposal: ProposalUpdate) => {
	const supabase = createClient();
	const { error } = await supabase.from('proposals').update(proposal).eq('id', id);

	if (error) {
		console.error(error);
		return;
	}

	revalidateTag('proposals');
};

export const updateTicket = async (id: string, ticket: TicketUpdate) => {
	const supabase = createClient();
	const { error } = await supabase.from('tickets').update(ticket).eq('id', id);

	if (error) {
		console.error(error);
		return;
	}

	revalidateTag('tickets');
};

export const updatePhase = async (id: string, phase: PhaseUpdate) => {
	const supabase = createClient();
	const { error } = await supabase.from('phases').update(phase).eq('id', id);

	if (error) {
		console.error(error);
		return;
	}

	revalidateTag('phases');
};

export const updateTask = async (id: string, task: TaskUpdate) => {
	const supabase = createClient();
	const { error } = await supabase.from('tasks').update(task).eq('id', id);

	if (error) {
		console.error(error);
		return;
	}

	revalidateTag('tasks');
};

export const updateSection = async (id: string, section: SectionUpdate) => {
	const supabase = createClient();
	const { error } = await supabase.from('sections').update(section).eq('id', id);

	if (error) {
		console.error(error);
		return;
	}

	revalidateTag('proposals');
	revalidateTag('sections');
};