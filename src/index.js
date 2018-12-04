import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Line from './line';
import LineResize from './lineResize';

const ResizableBox = require('react-resizable').ResizableBox;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
`;

export default class App extends React.Component {
  state = {data:initialData,mode:'dnd'};

  onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = this.state.data.lines[source.droppableId];
    const finish = this.state.data.lines[destination.droppableId];

    if (start === finish) {
      const newCardIds = Array.from(start.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newLine = {
        ...start,
        cardIds: newCardIds,
      };

      const newData = {
        ...this.state.data,
        lines: {
          ...this.state.data.lines,
          [newLine.id]: newLine,
        },
      };

      this.setState({data:newData});
      return;
    }

    //moving a card from one line to another
    const startCardIds = Array.from(start.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = {
      ...start,
      cardIds: startCardIds,
    };

    const finishCardIds = Array.from(finish.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      cardIds: finishCardIds,
    };

    const newData = {
      ...this.state.data,
      lines: {
        ...this.state.data.lines,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    this.setState({data:newData});

  };

  fillSpaceInStartLine() {

  }

  insertInFinishLine() {

  }
  
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Container>
          <button type='button' onClick={()=>{
              if (this.state.mode=='resize') {
                this.setState({mode:'dnd'});
              } else this.setState({mode:'resize'});
            }}
          > switch mode </button>

          {this.state.data.lineOrder.map(lineId => {
            const line =  this.state.data.lines[lineId];
            const cards = line.cardIds.map(cardId => this.state.data.cards[cardId]);
            if (this.state.mode!='resize') return <Line key={line.id} line={line} cards={cards}/>;
            else {
              return <LineResize key={line.id} line={line} cards={cards}/>;
              }
          })}
        </Container>

      </DragDropContext>


    )
  }
}
ReactDOM.render(<App />, document.getElementById('root'));
