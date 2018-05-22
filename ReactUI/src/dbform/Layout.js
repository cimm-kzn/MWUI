import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Icon, Select } from 'antd';
import {
  CreatePage,
  StructureListPage,
  SettingsPage,
} from './components';
import { LoaderView, ErrorView } from '../base/wrapper';
import { MainLayout } from '../components';
import 'antd/dist/antd.css';

const TabPane = Tabs.TabPane;

class Main extends Component {
  render() {
    const { settings } = this.props;
    const tabs = settings && settings.tabs;

    return (
      <MainLayout style={{ paddingTop: 75 }}>
        <LoaderView />
        <ErrorView />
        <Tabs
          defaultActiveKey="3"
          {...tabs}
        >
          <TabPane tab={<span><Icon type="file-add" />Create</span>} key="1">
            <CreatePage />
          </TabPane>
          <TabPane tab={<span><Icon type="database" />List</span>} key="3">
            <StructureListPage />
          </TabPane>
          <TabPane tab={<span><Icon type="setting" />Settings</span>} key="4">
            <SettingsPage />
          </TabPane>
        </Tabs>
      </MainLayout>
    );
  }
}

const mapStateToProps = state => ({
  settings: state.settings,
});


export default connect(mapStateToProps)(Main);
