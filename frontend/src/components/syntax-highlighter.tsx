import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import { JSX } from 'react/jsx-runtime';

export const SyntaxHighlightedCode = (props: JSX.IntrinsicAttributes & React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement>) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            hljs.highlightElement(ref.current);
        }
    }, [props.className, props.children]);

    return <code {...props} ref={ref} />;
};
