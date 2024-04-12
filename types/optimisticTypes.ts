export type ProductState = {
	newProduct?: NestedProduct;
	newProducts?: NestedProduct[];
	updatedProduct?: NestedProduct;
	updatedProducts?: NestedProduct[];
	deletedProduct?: string;
	pending: boolean;
};

export type PhaseState = {
	newPhases?: NestedPhase[];
	newPhase?: NestedPhase;
	updatedPhase?: NestedPhase;
	updatedPhases?: NestedPhase[];
	deletedPhase?: string;
	pending: boolean;
};

export type SectionState = {
	newSection?: SectionInsert;
	updatedSection?: SectionUpdate;
	deletedSection?: string;
	pending: boolean;
};

export type TicketState = {
	newTicket?: NestedTicket;
	updatedTicket?: NestedTicket;
	deletedTicket?: string;
	pending: boolean;
};

export type TaskState = {
	newTask?: TaskInsert;
	updatedTask?: Task;
	deletedTask?: string;
	pending: boolean;
};
