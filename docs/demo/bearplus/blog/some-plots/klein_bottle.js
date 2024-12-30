var option = {
  tooltip: {},
  visualMap: {
    show: false,
    dimension: 2,
    min: -1,
    max: 1,
    inRange: {
      color: [
        '#313695',
        '#4575b4',
        '#74add1',
        '#abd9e9',
        '#e0f3f8',
        '#ffffbf',
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026'
      ]
    }
  },
  xAxis3D: {
    min: -2.5,
    max: 2.5
  },
  yAxis3D: {
    min: -0.5,
    max: 4.5
  },
  zAxis3D: {
    min: -1.5,
    max: 1.5
  },
  grid3D: {
  },
  series: [
    {
      type: 'surface',
      parametric: true,
      shading: 'color',
      itemStyle: {
        opacity: 0.6
      },
      parametricEquation: {
        u: {
          min: -0.1,
          max: Math.PI
        },
        v: {
          min: -0.1,
          max: 2 * Math.PI
        },
        x: function(u, v) {
          return - 2 / 15 * Math.cos(u) * (3 * Math.cos(v) - 30 * Math.sin(u) + 90 * Math.pow(Math.cos(u), 4) * Math.sin(u) - 60 * Math.pow(Math.cos(u), 6) * Math.sin(u) + 5 * Math.cos(u) * Math.cos(v) * Math.sin(u));
        },
        y: function(u, v) {
          return - 1 / 15 * Math.sin(u) * (3 * Math.cos(v) - 3 * Math.pow(Math.cos(u), 2) * Math.cos(v) - 48 * Math.pow(Math.cos(u), 4) * Math.cos(v) + 48 * Math.pow(Math.cos(u), 6) * Math.cos(v) - 60 * Math.sin(u) + 5 * Math.cos(u) * Math.cos(v) * Math.sin(u) - 5 * Math.pow(Math.cos(u), 3) * Math.cos(v) * Math.sin(u) - 80 * Math.pow(Math.cos(u), 5) * Math.cos(v) * Math.sin(u) + 80 * Math.pow(Math.cos(u), 7) * Math.cos(v) * Math.sin(u));
        },
        z: function(u, v) {
          return 2 / 15 * (3 + 5 * Math.cos(u) * Math.sin(u)) * Math.sin(v);
        }
      }
    }
  ]
};