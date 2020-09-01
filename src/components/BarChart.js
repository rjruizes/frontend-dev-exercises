import React from 'react';
import Chart from 'chart.js'

// Change long strings into arrays which will insert line breaks
function cleanDisplayKeys(keys, filterKey) {
  if(filterKey === 'education_level') {
    keys[keys.indexOf('Professional School')] = ['Professional', 'School']
    keys[keys.indexOf('Did not complete high school')] = ['Did not', 'complete', 'high school']
  } else {
    keys[keys.indexOf('Asian-Pac-Islander')] = ['Asian,', 'Pac. Islander']
    keys[keys.indexOf('Amer-Indian-Eskimo')] = ['Amer. Indian,', 'Eskimo']
  }
  return keys
}

class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }
  componentDidMount() {
    let { keys, vals } = this.props.data
    keys = cleanDisplayKeys(keys, this.props.filterKey)
    
    this.myChart = new Chart(this.chartRef.current.getContext('2d'), {
      type: 'horizontalBar',
      data: {
          labels: keys,
          datasets: [{
            label: 'Above $50k',
            data: vals,
            backgroundColor: 'rgba(31, 120, 180, 0.75)',
          }, {
            label: 'Below $50k',
            data: vals.map(val => Math.abs(100 - val)),
            backgroundColor: 'rgba(165, 206, 227, 0.75)',
          }]
      },
      options: {
        tooltips: {
          enabled: true,
          callbacks: {
            title: (tooltipItems, data) => {
              // We have to undo the work done by cleanDisplayKeys()
              // The label is a string which was an array
              // 1) replace the commas (which signifies an array delimiter) with spaces
              // 2) replace double spaces (which signifies there was a comma) with slashes
              return tooltipItems[0].label.split(',').join(' ').replace('  ', '/')
            },
            label: (item, data) => {
              return data.datasets[item.datasetIndex].label + ': ' + parseInt(item.value)+'%'
            },
          }
        },
        legend: {
          position: 'bottom',
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: {
              max: 100,
              callback: function (value) {
                return (value / this.max * 100).toFixed(0) + '%'; // convert it to percentage
              },
            },
            stacked: true
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            stacked: true
          }]
        }
      }
    })
  }

  componentDidUpdate(prevProps) {
    let { keys, vals } = this.props.data;
    keys = cleanDisplayKeys(this.props.data.keys, this.props.filterKey)
    this.myChart.data.labels = keys;
    this.myChart.data.datasets[0].data = vals;
    this.myChart.data.datasets[1].data = vals.map(val => Math.abs(100 - val));
    this.myChart.update();
  }
  render() {
    return (
      <div className='chart-container'>
        <canvas ref={this.chartRef} />
      </div>
    )
  }
}

export default BarChart