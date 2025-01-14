
    #set page(width: auto, height: auto, fill: none)
    #import "@preview/fletcher:0.5.3" as fletcher: diagram, node, edge
    #diagram(
      edge-stroke: 1.5pt + white,
      node((0,0), [$e^-$], name: <e1>),
      node((0,2), [$e^+$], name: <e2>),
      node((1,1), name: <v>),
      node((2,0), [$gamma$], name: <g1>),
      node((2,2), [$gamma$], name: <g2>),
      edge(<e1>, "-|>-", <v>),
      edge(<e2>, "-<|-", <v>),
      edge(<v>, "~", <g1>),
      edge(<v>, "~", <g2>),
    )
    