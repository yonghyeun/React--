export function createElement(type, config, children) {
  let propName;

  // Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;

  if (config != null) {
    if (hasValidRef(config)) {
      if (!enableRefAsProp) {
        ref = config.ref;
        if (!disableStringRefs) {
          ref = coerceStringRef(ref, getOwner(), type);
        }
      }
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // Remaining properties are added to a new props object
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        // Skip over reserved prop names
        propName !== 'key' &&
        (enableRefAsProp || propName !== 'ref') &&
        // Even though we don't use these anymore in the runtime, we don't want
        // them to appear as props, so in createElement we filter them out.
        // We don't have to do this in the jsx() runtime because the jsx()
        // transform never passed these as props; it used separate arguments.
        propName !== '__self' &&
        propName !== '__source'
      ) {
        if (enableRefAsProp && !disableStringRefs && propName === 'ref') {
          props.ref = coerceStringRef(config[propName], getOwner(), type);
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  if (__DEV__) {
    if (key || (!enableRefAsProp && ref)) {
      const displayName =
        typeof type === 'function'
          ? type.displayName || type.name || 'Unknown'
          : type;
      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }
      if (!enableRefAsProp && ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }

  const element = ReactElement(
    type,
    key,
    ref,
    undefined,
    undefined,
    getOwner(),
    props,
  );

  if (type === REACT_FRAGMENT_TYPE) {
    validateFragmentProps(element);
  }

  return element;
}
