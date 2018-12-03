const initialData = {
  cards: {
    'card-1': { id: 'card-1', content:'1', widthOn16:2},
    'card-2': { id: 'card-2', content:'2', widthOn16:3},
    'card-3': { id: 'card-3', content:'3', widthOn16:4},
    'card-4': { id: 'card-4', content:'4', widthOn16:5},
    'card-5': { id: 'card-5', content:'5', widthOn16:6},
    'card-6': { id: 'card-6', content:'6', widthOn16:7},
  },
  lines: {
    'line-1':{
      id: 'line-1',
      title: 'Ensemble 1',
      cardIds: ['card-1','card-2','card-3','card-4'],
    },
    'line-2':{
      id: 'line-2',
      title: 'Ensemble 2',
      cardIds: ['card-5','card-6'],
    },
  },
  lineOrder: ['line-1','line-2'],
};

export default initialData;
