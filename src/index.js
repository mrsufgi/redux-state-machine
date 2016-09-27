import StateMachine from 'javascript-state-machine';
import map from 'lodash/map';
import zipObject from 'lodash/zipObject';
import fill from 'lodash/fill';

export const initial = 'INIT';
export const defaultState =
  {
    status: initial,
    error: null,
    [initial]: true,
    event: null
  };

/**
 * @param {Object} fsmConfig - Config as for javascript-state-machine
 */
const reducerBuilder = (fsmConfig) =>
{
  const fsm = StateMachine.create(Object.assign({}, fsmConfig, { initial }));
  const { events } = fsmConfig;
  const eventNames = map(events, 'name');
  const eventsCount = eventNames.length;
  const existEvent = zipObject(eventNames, fill(Array(eventsCount),
    true, 0, eventsCount));

  return (state = defaultState, action) =>
  {
    if (typeof existEvent[action.type] === 'undefined')
    {
      // Ignore not event actions
      return state;
    }

    if (fsm.cannot(action.type))
    {
      // Set error if transition imposible
      return {
        status: state.status,
        error: true,
        [state.status]: true,
        action
      };
    }

    fsm[action.type](action);
    return {
      status: fsm.current,
      error: null,
      [fsm.current]: true,
      action
    };
  };
};

export default reducerBuilder;