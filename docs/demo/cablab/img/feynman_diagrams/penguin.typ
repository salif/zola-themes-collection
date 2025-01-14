
    #set page(width: auto, height: auto, fill: none)
    #import "@preview/fletcher:0.5.3" as fletcher: diagram, node, edge
    #diagram(
      edge-stroke: 1.5pt + white,
      // Make 'wings' down along 'body' for fun
      // node((0,0), [$b$], name: <a>),
      node((0.5,2), name: <a>), // [$b$],

      node((1,1), name: <b>),
      node((2,1), name: <c>),

      // Make 'wings' down along 'body' for fun
      // node((3,0), [$s$], name: <d>),
      node((2.5,2), name: <d>), // [$s$], 

      node((1.5,2.5), name: <w>),
      node((1.5,3), name: <g>),

      node((1,3.5), name: <h>),
      node((2,3.5), name: <i>),

      edge(<a>, "-<|-", <b>),
      edge(<b>, "~", <c>), //, $W$
      edge(<c>, "-<|-", <d>),
      edge(<b>, "-<|-", <w>, bend: -10deg),
      edge(<w>, "-<|-", <c>, bend: -10deg),
      edge(<w>, "-", <g>, decorations: "coil"),
      edge(<g>, "-|>-", <h>),
      edge(<g>, "-<|-", <i>),
    )
    