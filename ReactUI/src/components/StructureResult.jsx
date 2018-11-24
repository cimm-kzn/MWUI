import React from 'react';
import PropTypes from 'prop-types';
import ImageResult from './ImageResult';
import { convertCmlToBase64 } from '../base/marvinAPI';


const StructureResult = ({ data, ...rest }) => (<ImageResult data={data && convertCmlToBase64(data)} {...rest} />);

StructureResult.proptypes = {
  data: PropTypes.string,
};

export default StructureResult;
