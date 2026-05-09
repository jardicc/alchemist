import React, {ReactElement} from "react";
import {Provider} from "react-redux";
import {createStore, Store, AnyAction} from "redux";
import {render, RenderOptions, RenderResult} from "@testing-library/react";

/**
 * Test helper that wraps a UI element with a Redux <Provider/>.
 *
 * Usage examples:
 *   renderWithStore(<Foo/>);                          // empty store
 *   renderWithStore(<Foo/>, {preloadedState: {...}}); // partial state
 *   renderWithStore(<Foo/>, {store: myMockStore});    // bring your own store
 *
 * The helper intentionally does NOT depend on the real root reducer so the
 * tests stay fast and isolated. Components that read concrete slices should
 * receive a `preloadedState` mock that matches `IRootState` shape (cast as any
 * if you only need a subset).
 *
 * It also returns the `store` so tests can dispatch actions or assert on
 * dispatched actions via `jest.spyOn(store, "dispatch")`.
 */
export interface IRenderWithStoreOptions extends Omit<RenderOptions, "wrapper"> {
	preloadedState?: unknown;
	store?: Store;
}

export interface IRenderWithStoreResult extends RenderResult {
	store: Store;
}

const identityReducer = <S,>(state: S, _action: AnyAction): S => state;

export function renderWithStore(
	ui: ReactElement,
	{preloadedState, store, ...renderOptions}: IRenderWithStoreOptions = {},
): IRenderWithStoreResult {
	const finalStore: Store = store ?? createStore(identityReducer, preloadedState as never);

	const Wrapper = ({children}: {children: React.ReactNode}): JSX.Element => (
		<Provider store={finalStore}>{children}</Provider>
	);

	const result = render(ui, {wrapper: Wrapper, ...renderOptions});
	return {...result, store: finalStore};
}
