import React, { useState, useEffect } from 'react';
import { Button, Radio, Slider } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import { csv } from 'd3-fetch';
import { rollup, descending, min, max } from 'd3-array';
import BarChart from './components/BarChart';

import 'antd/dist/antd.css'
import './App.css';
import Collapsible from './components/Collapsible';

const parseAgeRange = (rawData) => ({
    min: parseInt(min(rawData, d => d.age)),
    max: parseInt(max(rawData, d => d.age)),
    marks: [20, 30, 40, 50, 60, 70, 80, 90].reduce((result, item) => {
      result[item] = item;
      return result
    }, {})  
})

function App() {
  const [rawData, setRawData]     = useState(null)
  const [chartData, setChartData] = useState(null)
  const [groupBy, setGroupBy]     = useState('education_level')
  const [minAge, setMinAge]       = useState(null)
  const [maxAge, setMaxAge]       = useState(null)
  const [ageMarks, setAgeMarks]   = useState(null)
  const [ageFilter, setAgeFilter] = useState({ min: 17, max: 90 })
  const [sexFilter, setSexFilter] = useState('Both')
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)

  useEffect(() => {
    csv("https://raw.githubusercontent.com/rjruizes/frontend-dev-exercises/master/census.csv")
      .then(data => {
        const { min, max, marks } = parseAgeRange(data)
        setMinAge(min)
        setMaxAge(max)
        setAgeMarks(marks)
        setRawData(data)
      })
  }, [])

  useEffect(() => {
    if(!rawData) return
    let filteredData = rawData
    
    if(sexFilter !== 'Both') filteredData = filteredData.filter(d => d.sex === sexFilter);
    filteredData = filteredData.filter(d => d.age > ageFilter.min);
    filteredData = filteredData.filter(d => d.age < ageFilter.max);

    // rollup() returns a hashmap, {demographic: percentOver50k}
    const results = rollup(filteredData, filteredValues => {
      const totalCount = filteredValues.length
      const over50kCount = filteredValues.filter(d => d.over_50k === "1").length
      const percentOver50k = over50kCount / totalCount
      return percentOver50k * 100
    }, d => d[groupBy])
  
    // Change the hashmap to a sorted Array for displaying in the chart
    const arr = Array.from(results)
    const sortedData = arr.sort((a,b) => descending(a[1], b[1]))
    const keys = sortedData.map(d=>d[0])
    const vals = sortedData.map(d=>d[1])
    
    setChartData({ keys, vals })
  }, [groupBy, ageFilter, sexFilter, rawData]);

  return (
    <div className="wrapper">
        <h3>Percentage of People Who Make Above and Below $50,000</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 12, paddingRight: 12 }}>
          <Button style={{ visibility: 'hidden' }}>
            <FilterFilled />
          </Button>
          <Radio.Group
            options={[
              { label: 'By Education', value: 'education_level' },
              { label: 'By Race', value: 'race' },
            ]}
            onChange={e => setGroupBy(e.target.value)}
            value={groupBy}
            optionType="button"
          />
          <Button onClick={() => setCollapsibleOpen(!collapsibleOpen)} >
            <FilterFilled />
          </Button>
        </div>
        <Collapsible filterOpen={collapsibleOpen}>
          <div className='filterbox'>
              <div className='filterbox-item' style={{ flexBasis: 300 }}>
                <b>Age</b>
                { chartData ? <Slider range
                    min={minAge}
                    max={maxAge}
                    onAfterChange={(val) => setAgeFilter({ min: val[0], max: val[1] })}
                    defaultValue={[minAge, maxAge]}
                    marks={ageMarks}
                  /> : <div/> }
              </div>
              <div className='filterbox-item'>
                <b style={{ display: 'block', marginBottom: 5 }}>Sex</b>
                <Radio.Group
                  optionType="button"
                  value={sexFilter}
                  options={[
                    { label: 'Both', value: 'Both' },
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                  ]}
                  onChange={e => setSexFilter(e.target.value)}
                />
              </div>
            </div>
          </Collapsible>
        { chartData ? <BarChart data={chartData} filterKey={groupBy} /> : <div/>}
    </div>
  );
}

export default App;
