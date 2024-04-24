
let chart = bb.generate({
    bindto: "#chart",
    data: {
      type: "bar",

      columns: [
        ["data1", 50, 90],
        ["data2", 30, 13],
      ],
    },
    axis: {
      x: {
        type: "category",
        categories: ["cat1", "cat2"],
      },
    },
  });