
    #set page(width: auto, height: auto, fill: none)
    #import "@preview/fletcher:0.5.3" as fletcher: diagram, node, edge
    #diagram(
      edge-stroke: 1.5pt + white,
      node((0,0), [$e^-$], name: <a>),
      node((2,0), [$e^-$], name: <b>),
      node((0,2), [$gamma$], name: <g1>),
      node((2,2), [$gamma$], name: <g2>),
      node((1,1), name: <c>),
      edge(<g1>, "~", <c>),
      edge(<a>, "-|>-", <c>),
      edge(<c>, "-|>-", <b>),
      edge(<c>, "~", <g2>),
    )
    