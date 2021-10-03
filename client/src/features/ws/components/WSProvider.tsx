import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventListener, useEvents } from '../../editor/hooks/useEvents';
import { Config } from '../../../Config';
import { useProjects } from '../../user/hooks/useProjects';
import { useUser } from '../../user/hooks/useUser';

export type WSProviderContextType = {
	ws?: WebSocket;
	sendWS: (data: unknown) => void;
};

export const WSProviderContext = React.createContext<WSProviderContextType>({
	sendWS: () => {},
});

let resolve = () => {};
const isWsReadyPromise = new Promise<void>((_resolve) => {
	resolve = _resolve;
});
isWsReadyPromise.then();

export function WSProvider({ children }: React.PropsWithChildren<{ a?: false }>): JSX.Element {
	const { send } = useEvents();
	const { authToken } = useUser();
	const { currentProjectId } = useProjects();

	const [ws, setWs] = useState(() => new WebSocket(Config.websocket));

	const sendWS = useCallback(
		async (data: unknown, skipReady = false) => {
			if (!skipReady) await isWsReadyPromise;
			if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
		},
		[ws],
	);

	useEffect(() => {
		ws.onmessage = (event) => {
			const jsonEvent = JSON.parse(event.data);
			if (jsonEvent.id) send(`ws/${jsonEvent.id}`, jsonEvent);
			if (jsonEvent.action) send(`ws/${jsonEvent.action}`, jsonEvent);
		};
	}, [send, ws]);

	useEventListener(
		'ws/init',
		(event) => {
			if (event.action === 'init')
				sendWS({ action: 'init', id: event.id, token: authToken, projectId: currentProjectId }, true);
		},
		[sendWS],
	);

	useEventListener('ws/auth.success', resolve, [sendWS]);

	const value = useMemo<WSProviderContextType>(() => ({ ws, sendWS }), [ws, sendWS]);

	return (
		<WSProviderContext.Provider value={value}>
			<>{children}</>
		</WSProviderContext.Provider>
	);
}
