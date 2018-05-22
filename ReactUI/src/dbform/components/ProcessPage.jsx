import React from 'react';
import { Card, Icon, List } from 'antd';
import { connect } from 'react-redux';

const ProcessPage = ({ settings }) => {
 // const { settings } = this.props;
  const gridSettings = settings && settings.grid;

  return settings && (
    <List
      grid={{ ...gridSettings, gutter: 20 }}
      dataSource={[]}
      renderItem={item => (
        <List.Item
          key={item.id}
        >
          <Card title={'Task #'} extra={<a><Icon type="close" /></a>} style={{ width: 300 }}>
            <p>content</p>
          </Card>
        </List.Item>
      )}
    />
  );
};


const mapStateToProps = state => ({
  settings: state.settings,
});

export default connect(mapStateToProps)(ProcessPage);
