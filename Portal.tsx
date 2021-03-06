/// <reference lib="dom" />
import * as React  from './deps.ts';
import {Compat,Compat as ReactDOM}  from './deps.ts';
import { useRef, useEffect, useImperativeHandle } from './deps.ts';
import canUseDom from './Dom/canUseDom.ts';

export type PortalRef = {};

export interface PortalProps {
  didUpdate?: (prevProps: PortalProps) => void;
  getContainer: () => HTMLElement|undefined;
  children?: React.VNode;
}

const Portal = Compat.forwardRef<PortalRef, PortalProps>((props, ref) => {
  const { didUpdate, getContainer, children } = props;

  const containerRef = useRef<HTMLElement>();

  // Ref return nothing, only for wrapper check exist
  useImperativeHandle(ref, () => ({}));

  // Create container in client side with sync to avoid useEffect not get ref
  const initRef = useRef(false);
  if (!initRef.current && canUseDom()) {
    containerRef.current = getContainer();
    initRef.current = true;
  }

  // [Legacy] Used by `rc-trigger`
  useEffect(() => {
    didUpdate?.(props);
  });

  useEffect(() => {
    return () => {
      // [Legacy] This should not be handle by Portal but parent PortalWrapper instead.
      // Since some component use `Portal` directly, we have to keep the logic here.
      containerRef.current?.parentNode?.removeChild(containerRef.current);
    };
  }, []);

  return containerRef.current
    ? ReactDOM.createPortal(children!, containerRef.current)
    : null;
});

export default Portal;
