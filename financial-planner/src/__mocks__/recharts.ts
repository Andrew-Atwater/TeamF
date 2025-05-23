const MockComponent = () => {
    return { type: 'div', props: { children: 'Mock Component' } };
};

module.exports = {
    LineChart: MockComponent,
    Line: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    Legend: MockComponent,
    ResponsiveContainer: MockComponent
};