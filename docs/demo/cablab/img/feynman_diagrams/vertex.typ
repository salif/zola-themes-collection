
    #set page(width: auto, height: auto, fill: none)
    #import "@preview/fletcher:0.5.3" as fletcher: diagram, node, edge
    #diagram(
      edge-stroke: 1.5pt + white,
    $
      e^- edge("rd", "-<|-") & & & edge("ld", "-<|-") e^- \
      & edge(gamma, "wave") \
      e^- edge("ru", "-|>-") & & & edge("lu", "-|>-") e^- \
    $)
    