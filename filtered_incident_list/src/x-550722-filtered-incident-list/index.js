import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '@servicenow/now-modal';
import '@servicenow/now-loader';
import '@servicenow/now-input';
import '@servicenow/now-template-card';
import { createHttpEffect } from '@servicenow/ui-effect-http';

const { COMPONENT_BOOTSTRAPPED, COMPONENT_ERROR_THROWN } = actionTypes;


const view = (state, { updateState }) => {
	const { DATA, activeInc, filteredData } = state;
	return (
		DATA ?
			<div>
				<form className='filter-wrapper'>
					<now-input
						autofocus
						label="Filter"
						placeholder="Input text of any field..."
						step="any"
						type="text"
					>
					</now-input>
				</form>
				{filteredData.map(card => (
					<now-template-card-assist
						tagline={{ 'icon': 'tree-view-long-outline', 'label': card.sys_class_name }}
						actions={[{ 'id': 'open', 'label': 'Open record', 'inc': card }, { 'id': 'delete', 'label': 'Delete', 'sys_id': card.sys_id }]}
						heading={{ 'label': card.short_description }}
						content={[{ 'label': 'Number', 'value': { 'type': 'string', 'value': card.number } },
						{ 'label': 'State', 'value': { 'type': 'string', 'value': card.incident_state } },
						{ 'label': 'Assigment Group', 'value': { 'type': 'string', 'value': card.assignment_group.display_value } },
						{ 'label': 'Assigned To', 'value': { 'type': 'string', 'value': card.assigned_to.display_value } },
						]}
						footerContent={{ 'label': 'Updated', 'value': card.sys_updated_on }}
					>
					</now-template-card-assist>
				))
				}
				<now-modal
					opened={activeInc ? true : false}
					size='lg'
					defaultSlot
					footerActions={[
						{
							"variant": "primary-negative",
							"label": "Delete",
							"sys_id": activeInc ? activeInc.sys_id : ''
						}
					]}
				>
					{activeInc ?
						<form className='modal'>
							<div className='modal_input-wrapper'>
								<label className='modal_label' htmlFor='number'>Number</label>
								<input className='modal_input' value={activeInc.number} name='number'></input>
							</div>
							<div className='modal_input-wrapper'>
								<label className='modal_label' htmlFor='incident state'>State</label>
								<input className='modal_input' value={activeInc.incident_state} name='incident state'></input>
							</div>
							<div className='modal_input-wrapper'>
								<label className='modal_label' htmlFor='opened at'>Opened At</label>
								<input className='modal_input' value={activeInc.opened_at} name='opened at'></input>
							</div>
							<div className='modal_input-wrapper'>
								<label className='modal_label' htmlFor='short description'>Short Description</label>
								<input className='modal_input' value={activeInc.short_description} name='short description'></input>
							</div>
							<div className='modal_input-wrapper'>
								<label className='modal_label' htmlFor='assignment group'>Assignment Group</label>
								<input className='modal_input' value={activeInc.assignment_group.display_value} name='assignment group'></input>
							</div>
							<div className='modal_input-wrapper'>
								<label className='modal_label' htmlFor='assigned to'>Assigned To</label>
								<input className='modal_input' value={activeInc.assigned_to.display_value} name='assigned to'></input>
							</div>
						</form> : ''
					}
				</now-modal>
			</div> :
			displayLoading()
	);
};

// ------------- Input filter value changing ------------- //

const filterValueChanged = (coeffects) => {
	const { action, updateState, state } = coeffects;
	const { fieldValue } = action.payload;
	const { DATA } = state;
	let filteredData = filterData(DATA, fieldValue)
	updateState({ filteredData })
}

// ------------- Filter the incidents ------------- //

const filterData = (data, search) => {
	if (!search) {
		return data;
	}

	// ------------- Checking fields for the presence of the entered string ------------- //

	function checkIncluding(field) {
		return field ?
			field.toString().toLowerCase().includes(search.toLowerCase().toLocaleString()) :
			field
	}

	// ------------- List of the fields checking ------------- //

	let result = data.filter(inc => {
		return (
			(checkIncluding(inc['number'])) ||
			(checkIncluding(inc['incident_state'])) ||
			(checkIncluding(inc['opened_at'])) ||
			(checkIncluding(inc['sys_class_name'])) ||
			(checkIncluding(inc['sys_updated_on'])) ||
			(checkIncluding(inc['short_description'])) ||
			(checkIncluding(inc['assignment_group'].display_value)) ||
			(checkIncluding(inc['assigned_to'].display_value))
		)
	});
	return result;
}

// ------------- Display loading block ------------- //

function displayLoading() {
	return (
		<div className='loading-block'>
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
	errorActionType: COMPONENT_ERROR_THROWN
});

// ------------- Handle the request in the case of success ------------- //

const handleFetchSucceed = (coeffects) => {
	const { action, updateState } = coeffects;
	const { result } = action.payload;
	updateState({ DATA: result, filteredData: result });
};

// ------------- Handle the request in the case of fail ------------- //

const handleFetchFailed = ({ action: { payload } }) => console.log(payload);

// ------------- Handle actions in the dropdown menu ------------- //

const handleDropDown = (coeffects) => {
	const { action, dispatch } = coeffects;
	const { item } = action.payload;
	switch (item.id) {
		case 'open': dispatch('MODAL_OPEN', { inc: item.inc });
			break;
		case 'delete': dispatch('INCIDENT_DELETE_REQUESTED', { sys_id: item.sys_id });
			break;
	}
}

// ------------- Create Http Effect to delete the chosen incident ------------- //

const fetchDeleteEffect = createHttpEffect('api/now/table/incident/:sys_id', {
	method: 'DELETE',
	pathParams: ['sys_id'],
	successActionType: 'INCIDENT_DELETED',
	errorActionType: COMPONENT_ERROR_THROWN
});

// ------------- Handle the successful delete of the incident ------------- //

const handleDelete = (coeffects) => {
	const { dispatch } = coeffects;
	alert('Incident deleted!');
	dispatch('INCIDENTS_FETCH', {});
}

// ------------- Trigger footer modal window action to delete the chosen incident ------------- //

const handleFooterAction = (coeffects) => {
	const { dispatch, state } = coeffects;
	const { activeInc } = state;
	dispatch('INCIDENT_DELETE_REQUESTED', { sys_id: activeInc.sys_id });
	dispatch('NOW_MODAL#OPENED_SET', {});
};

// ------------- Open the modal window ------------- //

const handleModalWindow = (coeffects) => {
	const { action, updateState } = coeffects;
	const { inc } = action.payload;
	updateState({ activeInc: inc });
};

createCustomElement('x-550722-filtered-incident-list', {
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: fetchIncidents,
		'INCIDENTS_FETCH': fetchIncidentsEffect,
		'FETCH_SUCCEEDED': handleFetchSucceed,
		[COMPONENT_ERROR_THROWN]: handleFetchFailed,
		'NOW_DROPDOWN_PANEL#ITEM_CLICKED': handleDropDown,
		'MODAL_OPEN': handleModalWindow,
		'NOW_MODAL#FOOTER_ACTION_CLICKED': handleFooterAction,
		'NOW_MODAL#OPENED_SET': handleModalWindow,
		'INCIDENT_DELETE_REQUESTED': fetchDeleteEffect,
		'INCIDENT_DELETED': handleDelete,
		'NOW_INPUT#INPUT': filterValueChanged
	},
	renderer: { type: snabbdom },
	view,
	styles
});
