import React from 'react';
import { connect } from 'react-redux';
import { Pagination } from 'antd';
import { getPages } from '../core/selectors';


const PaginationComp = ({ pages, ...rest }) => (
  <div>
    <Pagination
      pageSize={15}
      total={pages && pages.total}
      {...rest}
    />
  </div>
);

const mapStateToProps = state => ({
  pages: getPages(state),
});

export default connect(mapStateToProps)(PaginationComp);
