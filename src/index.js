import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Line from './line';
import LineResize from './lineResize';

var dotProp = require('dot-prop-immutable');

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

    this.fillSpaceInStartLine(newStart);

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

  fillSpaceInStartLine(newStart) {
    let totalWidthOn16 = 0;
    let listOfCardIds = Object.keys(newStart);
    for (var i = 0; i < listOfCardIds.length; i++) {
      let cardId = dotProp.get(newStart,listOfCardIds[i])
      let cardIdWidthOn16 = dotProp.get(this.state.data.cards,cardId+'.widthOn16')
      totalWidthOn16 = totalWidthOn16 + cardIdWidthOn16;
    }
    //on rallonge la dernière card de la start line
    let IdOfLastCard = listOfCardIds[listOfCardIds.length-1]
    let formerWidthOn16 = dotProp.get(this.state.data.cards,IdOfLastCard+'.widthOn16')
    let newData = dotProp.set(this.state.data.cards,'cards.'+IdOfLastCard+'.widthOn16',formerWidthOn16+16-totalWidthOn16)
    this.setState({data:newData});
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
