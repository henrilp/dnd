function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const initialData = {
  cards: {
    'card-1': { id: 'card-1', color:getRandomColor(), widthOn16:1},
    'card-2': { id: 'card-2', color:getRandomColor(), widthOn16:4},
    'card-3': { id: 'card-3', color:getRandomColor(), widthOn16:5},
    'card-4': { id: 'card-4', color:getRandomColor(), widthOn16:6},
    'card-5': { id: 'card-5', color:getRandomColor(), widthOn16:7},
    'card-6': { id: 'card-6', color:getRandomColor(), widthOn16:9},
  },
  lines: {
    'line-1':{
      id: 'line-1',
      cardIds: ['card-1','card-2','card-3','card-4'],
    },
    'line-2':{
      id: 'line-2',
      cardIds: ['card-5','card-6'],
    },
  },
  lineOrder: ['line-1','line-2'],
};

export default initialData;
