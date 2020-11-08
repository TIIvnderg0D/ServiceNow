import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import '@servicenow/now-template-card';
import { DATA } from './data.js';
import styles from './styles.scss';

const view = (state, { updateState }) => {
	return (
		<div>
			{DATA.map(card => (
				<now-template-card-assist
					tagline={card.tagline}
					actions={card.actions}
					heading={card.heading}
					content={card.content}
					footerContent={card.footerContent}
					configAria={card.configAria}
					contentItemMinWidth={card.contentItemMinWidth}
				>
				</now-template-card-assist>)
			)}
		</div>
	);
};

createCustomElement('x-550722-card-list', {
	renderer: { type: snabbdom },
	view,
	styles
});
