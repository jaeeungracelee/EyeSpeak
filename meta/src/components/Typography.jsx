// src/components/Typography.jsx
import React from 'react';
import PropTypes from 'prop-types';

const H1 = ({ className = '', children }) => {
  return (
    <h1 className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${className}`}>
      {children}
    </h1>
  );
};

H1.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const H2 = ({ className = '', children }) => {
  return (
    <h2 className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className}`}>
      {children}
    </h2>
  );
};

H2.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const H3 = ({ className = '', children }) => {
  return (
    <h3 className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

H3.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const P = ({ className = '', children }) => {
  return (
    <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}>
      {children}
    </p>
  );
};

P.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export { H1, H2, H3, P };
