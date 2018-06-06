import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Menu } from 'antd';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';
import { SkipLoader } from '../base/hocs';
import { MainLayout } from '../components';
import { URLS } from '../config';
import { SAGA_INIT_CONSTANTS } from './core/constants';


const Content = styled.div`
  margin-top: 20px;
`;

class Main extends Component {
  constructor(props) {
    super(props);
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }
  componentDidMount() {
    const { initConstants } = this.props;
    initConstants();
  }

  handleMenuClick({ key }) {
    const { history } = this.props;
    if (key === 'create') {
      history.push(URLS.INDEX);
    } else if (key === 'processing') {
      history.push(URLS.PROCESSING);
    } else {
      history.push(URLS.SAVED_TASK);
    }
  }

  render() {
    const { children, location } = this.props;

    let activeKey = '';

    if (location.pathname === URLS.SAVED_TASK) {
      activeKey = 'saved';
    } else if (location.pathname === URLS.PROCESSING) {
      activeKey = 'processing';
    } else {
      activeKey = 'create';
    }

    const SwithLoaders = (location.pathname === URLS.RESULT) ? SkipLoader : LoaderView;

    return (
      <SwithLoaders>
        <MainLayout>
          <MarvinEditorView />
          <ErrorView />
          <Menu
            onClick={this.handleMenuClick}
            selectedKeys={[activeKey]}
            mode="horizontal"
          >
            <Menu.Item key="create">
              <Icon type="file-add" />Create task
            </Menu.Item>
            <Menu.Item key="processing">
              <Icon type="sync" />Processing
            </Menu.Item>
            <Menu.Item key="saved">
              <Icon type="database" />Saved tasks
            </Menu.Item>
          </Menu>
          <Content>
            { activeKey === 'create' ?
              <PageStepsView />
              :
              null
            }
            {children}
          </Content>
        </MainLayout>
      </SwithLoaders>
    );
  }
}

const mapDispathToProps = dispatch => ({
  initConstants: () => dispatch({ type: SAGA_INIT_CONSTANTS }),
});

export default withRouter(connect(null, mapDispathToProps)(Main));
