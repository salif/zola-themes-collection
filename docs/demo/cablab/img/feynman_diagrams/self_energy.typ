
    #set page(width: auto, height: auto, fill: none)
    #import "@preview/fletcher:0.5.3" as fletcher: diagram, node, edge
    #diagram(
      edge-stroke: 1.5pt + white,
      node((0,0), [$e^-$], name: <a>),
      node((1,0), name: <b>),
      node((2,0), name: <c>),
      node((3,0), [$e^-$], name: <d>),
      edge(<a>, "-", <b>),
      edge(<b>, "-|>-", <c>),
      edge(<b>, "~", <c>, bend: 90deg),
      edge(<c>, "-", <d>),
    )
    