import React, { Component } from 'react';
import { Column } from '@ant-design/charts';

class DemoColumn extends Component{

  constructor(props) {
    super(props);
  }

  render() {
    var bar_Color = this.props.bar_Color;
    var data = [
      {
        type: 'School 1',
        sales: 38,
      },
      {
        type: 'School 2',
        sales: 52,
      },
      {
        type: 'School 3',
        sales: 61,
      },
      {
        type: 'School 4',
        sales: 145,
      },
      {
        type: 'School 5',
        sales: 48,
      },
      {
        type: 'School 6',
        sales: 38,
      },
      {
        type: 'School 7',
        sales: 38,
      },
      {
        type: 'School 8',
        sales: 38,
      },
    ];
    var config = {
      data: data,
      xField: 'type',
      yField: 'sales',
      color: bar_Color,
      label: {
        position: 'middle',
        style: {
          fill: '#FFFFFF',
          opacity: 0.6,
        },
      },
      meta: {
        type: { alias: 'School' },
        sales: { alias: 'Sales' },
      },
    };
    return <Column {...config} />;
  }
  
};

export default DemoColumn;