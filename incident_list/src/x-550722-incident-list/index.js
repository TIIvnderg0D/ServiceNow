import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '@servicenow/now-template-card';
import '@servicenow/now-loader';
import { createHttpEffect } from '@servicenow/ui-effect-http';

const { COMPONENT_BOOTSTRAPPED } = actionTypes;

const view = (state, { updateState }) => {
	const { DATA } = state;
	return (
		DATA ?
			<div>
				{DATA.map(card => (
					<now-template-card-assist
						tagline={{ "icon": "tree-view-long-outline", "label": card.sys_class_name }}
						actions={[]}
						heading={{ "label": card.short_description }}
						content={[{ "label": "Number", "value": { "type": "string", "value": card.number } },
						{ "label": "State", "value": { "type": "string", "value": card.incident_state } },
						{ "label": "Assigment Group", "value": { "type": "string", "value": card.assignment_group.display_value } },
						{ "label": "Assigned To", "value": { "type": "string", "value": card.assigned_to.display_value } },
						]}
						footerContent={{ "label": "Updated", "value": card.sys_updated_on }}
					>
					</now-template-card-assist>
				))}
			</div> : 
		displayLoading()
	);
};

// ------------- Display loading block ------------- //

function displayLoading() {
	return (
		<div className="loading-block">
			<now-loader label="Loading..."></now-loader>
			<p>Please wait</p>
		</div>
	)
}

// ------------- Call the creating of http effect ------------- //

const fetchIncidents = (coeffects) => {
	const { dispatch } = coeffects;
	dispatch('INCIDENTS_FETCH', {});
}

// ------------- Create Http Effect for incidents list ------------- //

const fetchIncidentsEffect = createHttpEffect('api/now/table/incident?sysparm_display_value=true', {
	method: 'GET',
	successActionType: 'FETCH_SUCCEEDED',
	errorActionType: 'FETCH_FAILED'
});

// ------------- Handle the request in the case of success ------------- //

const handleFetchSucceed = (coeffects) => {
	const { action, updateState } = coeffects;
	const { result } = action.payload;
	updateState({ DATA: result });
};

// ------------- Handle the request in the case of fail ------------- //

const handleFetchFailed = ({ action: { payload } }) => console.log(payload);

createCustomElement('x-550722-incident-list', {
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: fetchIncidents,
		'INCIDENTS_FETCH': fetchIncidentsEffect,
		'FETCH_SUCCEEDED': handleFetchSucceed,
		'FETCH_FAILED': handleFetchFailed
	},
	renderer: { type: snabbdom },
	view,
	styles
});
