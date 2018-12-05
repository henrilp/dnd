import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Line from './line';
import LineResize from './lineResize';

var dotProp = require('dot-prop-immutable');

const ContainerLines = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  border: 1px solid lightgrey;
  float: left;
`;

const ContainerSpe = styled.div`
  border: 2px solid lightgrey;
  width: 200px;
  display: flex;
  flex-direction: column;
  /*****/
`;

const ContainerSpeButton = styled.div`
  text-align: center;
`;

const ContainerSpeDroppable = styled.div`
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ContainerCardRow = styled.div`
  flex: 0 0 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const ContainerCard = styled.div`
  border: 1px solid grey;
  border-radius: 2px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : '#F7D358')};
  flex: 0 0 48px;
  text-align: center;
  line-height: 50px;
  width: 48px;
`;



export default class App extends React.Component {
  state = {data:initialData,mode:'dnd'};

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

/***********************/
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
    /******************* delete card case *****************/
    if (destination.droppableId === 'speContainer' && source.droppableId !== 'speContainer') {
      let lineId = source.droppableId;
      let newData = this.state.data;
      let cardsOfLine = dotProp.get(newData.lines,lineId+'.cardIds');
      cardsOfLine.splice(cardsOfLine.indexOf(draggableId),1);
      newData = dotProp.delete(newData,'cards.'+draggableId);
      newData = this.fillSpaceInStartLine(newData,dotProp.get(newData.lines,lineId));

      /******* delete line case *****/
      let lineOrder = newData.lineOrder;
      if (dotProp.get(newData.lines,lineId+'.cardIds').length === 0
        && lineOrder.indexOf(lineId) === lineOrder.length - 1
      ) {
        lineOrder.splice(lineOrder.indexOf(lineId),1)
        newData = dotProp.delete(newData,'lines.'+lineId);
      }
      console.log(newData)
      this.setState({data:newData});
      return;
    }
    /******************* new card case *****************/
    if (source.droppableId === 'speContainer') {
      let newData;
      let cardId = 'newCard-0';

      while (this.state.data.cards.hasOwnProperty(cardId)) {
        let num = parseInt(cardId.split('-')[1])+1;
        cardId = 'newCard-'+num; /*unique ID*/
      }
      let newCard = {
          id: cardId,
          color:this.getRandomColor(),
          widthOn16:2,
      };
      newData = dotProp.merge(this.state.data,'cards.'+cardId,newCard);

      if (destination.droppableId === 'lineEmpty'){
        /***** new line case ****/
        newData = dotProp.set(newData,'cards.'+cardId+'.widthOn16',16);
        let lineId = 'newLine-0';
        while (this.state.data.lines.hasOwnProperty(lineId)) {
          let num = parseInt(lineId.split('-')[1])+1;
          lineId = 'newLine-'+num; /*unique ID*/
        }
        let newLine = {
            id: lineId,
            cardIds:[cardId],
        };
        newData = dotProp.merge(newData,'lines.'+lineId,newLine);
        newData = dotProp.merge(newData,'lineOrder',[lineId])
      }
      else { /*** destination : existing line ****/
        newData = this.insertInFinishLine(newData,destination.droppableId,destination.index,cardId)
      }
      this.setState({data:newData})
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

    let newData = this.fillSpaceInStartLine(this.state.data,newStart);

    const finishCardIds = Array.from(finish.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      cardIds: finishCardIds,
    };

//receives : newData,destination.droppableId,destination.index,cardId
    newData = this.insertInFinishLine(newData,destination.droppableId,destination.index,draggableId);

    newData = {
      ...newData,
      lines: {
        ...newData.lines,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    this.setState({data:newData});

  };

  fillSpaceInStartLine(data,newStart) {
    let totalWidthOn16 = 0;
    let listOfCardIds = dotProp.get(newStart,'cardIds');
    for (var i = 0; i < listOfCardIds.length; i++) {
      let cardIdWidthOn16 = dotProp.get(data.cards,listOfCardIds[i]+'.widthOn16')
      totalWidthOn16 = totalWidthOn16 + cardIdWidthOn16;
    }
    //on rallonge la dernière card de la start line
    let IdOfLastCard = listOfCardIds[listOfCardIds.length-1];
    let formerWidthOn16 = dotProp.get(data.cards,IdOfLastCard+'.widthOn16');
    let newData = dotProp.set(data,'cards.'+IdOfLastCard+'.widthOn16',formerWidthOn16+16-totalWidthOn16)
    return newData;
  }

  insertInFinishLine(data,lineId,index,cardId) {

    let cardList = dotProp.get(data,'lines.'+lineId+'.cardIds');
    cardList.splice(index, 0, cardId);

    if (index !== 0 && index !== cardList.length - 1){
      let widthAtLeft = dotProp.get(data.cards,cardList[index-1]+'.widthOn16');
      let widthAtRight = dotProp.get(data.cards,cardList[index+1]+'.widthOn16');
      if (widthAtLeft > 2 && widthAtRight > 2) {
        //case big neighbors
        data = dotProp.set(data,'cards.'+cardId+'.widthOn16',2)
        data = dotProp.set(data,'cards.'+cardList[index-1]+'.widthOn16',widthAtLeft-1);
        data = dotProp.set(data,'cards.'+cardList[index+1]+'.widthOn16',widthAtRight-1);
        return data;
      }
    }
    //other case : widthOn16 = 1, check all modulo neighbors in range 1 then 2 etc, if not possible (16 elements in line) return data
    if ( cardList.length === 17 ) {
      cardList.splice(index,1);
      return data;
    }

    data = dotProp.set(data,'cards.'+cardId+'.widthOn16',1);
    let range = 1;

    while( range < cardList.length ) {
      let rightRangedNeighborIndex = Math.abs((index+range) % cardList.length);
      let rightRangedNeighborWidthOn16 = dotProp.get(data.cards,cardList[rightRangedNeighborIndex]+'.widthOn16');
      if (rightRangedNeighborWidthOn16 > 1) {
        data = dotProp.set(data,'cards.'+cardList[rightRangedNeighborIndex]+'.widthOn16',rightRangedNeighborWidthOn16-1);
        break;
      }
      let leftRangedNeighborIndex = Math.abs((index-range) % cardList.length);
      let leftRangedNeighborWidthOn16 = dotProp.get(data.cards,cardList[leftRangedNeighborIndex]+'.widthOn16');
      if (leftRangedNeighborWidthOn16 > 1) {
        data = dotProp.set(data,'cards.'+cardList[leftRangedNeighborIndex]+'.widthOn16',leftRangedNeighborWidthOn16-1);
        break;
      }
      range++;
    }
    return data;

  }

  add1OnRight(lineId,index) {
    let line =  this.state.data.lines[lineId];
    let cards = line.cardIds.map(cardId => this.state.data.cards[cardId]);
    /*cards[index]*/
  }

  render() {
    return (
        <DragDropContext onDragEnd={this.onDragEnd} >
          <div style={{display:'flex'}}>
            <ContainerLines>
              {this.state.data.lineOrder.map(lineId => {
                const line =  this.state.data.lines[lineId];
                const cards = line.cardIds.map(cardId => this.state.data.cards[cardId]);
                if (this.state.mode!=='resize') return <Line key={line.id} line={line} cards={cards}/>;
                else {
                  return <LineResize key={line.id} line={line} cards={cards} add1OnRight={(e)=>this.add1OnRight(lineId,e)}/>;
                  }
              })}
              {/*** EMPTY LINE ***/}
              {this.state.mode!=='resize' ? <Line line={{id:'lineEmpty'}} cards={[]}/>
            : <LineResize line={{id:'lineEmpty'}} cards={[]}/>}
            </ContainerLines>

            {/*******  CONTAINER SPE   ******/}
            <ContainerSpe>
              <ContainerSpeButton>
              <button type='button' onClick={()=>{
                  if (this.state.mode==='resize') {
                    this.setState({mode:'dnd'});
                  } else this.setState({mode:'resize'});
              }}>
                switch mode
              </button>
              </ContainerSpeButton>

              <Droppable droppableId={'speContainer'} direction="vertical">
                {(provided, snapshot) => (
                <ContainerSpeDroppable
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                {/*** NEW CARD ***/}
                <ContainerCardRow>
                  <Draggable draggableId={'newCard'} index={0}>
                    {(provided, snapshot) => (
                      <ContainerCard
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        isDragging={snapshot.isDragging}
                        widthOn16={2}
                      >
                        Drag!
                      </ContainerCard>
                    )}
                  </Draggable>
                  </ContainerCardRow>
                  {provided.placeholder}
                </ContainerSpeDroppable>
                )}
              </Droppable>
            </ContainerSpe>
          </div>
        </DragDropContext>
    )
  }
}
ReactDOM.render(<App />, document.getElementById('root'));
