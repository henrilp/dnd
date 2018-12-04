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
  width: 200px;
  background-color: lightblue;
  float: left;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  border: 1px solid lightgrey;
`;

const ContainerSpe2 = styled.div`
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}
  height:'100%',
  width:'100%',
  display:'flex',
  flexDirection:'column',
  justifyContent:'center',
  alignItems:'center'
`;

const ContainerCard = styled.div`
  border: 1px solid grey;
  border-radius: 2px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : '#F7D358')};
  /*width fixed*/
  flex: 0 0 50px;
  width : 100px;
  text-align: center;
  /*margin-left: auto;
  margin-right: auto;*/
`;

export default class App extends React.Component {
  state = {data:initialData,mode:'dnd'};

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
    /******************* new card case *****************/
    if (source.droppableId === 'speContainer') {
      let cardId = 'newCard-0'
      if (this.state.data.cards.hasOwnProperty(cardId)) {
        cardId = cardId+'0'; /*unique ID*/
      }
      let newCard = {
        cardId : {
          'id': cardId,
          'content':'nouveau block !',
          'widthOn16':'2'
        },
      };
      this.setState({data:dotProp.merge(this.state.data,'cards',newCard)});

      if (destination.droppableId === 'lineEmpty'){
        /***** new line case ****/
        let lineId = 'newLine-0';
        if (this.state.data.lines.hasOwnProperty(lineId)) {
          lineId = lineId+'0'; /*unique ID*/
        }
        let newLine = {
          lineId : {
            'id': lineId,
            'cardIds':[cardId]
          }
        }
        let newData = {
          ...this.state.data,
          lines:{
            ...this.state.lines,
            newLine
          },
        };
        dotProp.merge(this.state.data,'lines',newLine)
        newData = dotProp.merge(newData,'lineOrder',[lineId])
        this.setState({data:newData});

      }
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

    newData = this.insertInFinishLine(newData,finish,newFinish);

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

  insertInFinishLine(data,finish,newFinish) {
    // let totalWidthOn16 = 0;
    // let listOfCardIds = dotProp.get(newStart,'cardIds');
    // for (var i = 0; i < listOfCardIds.length; i++) {
    //   let cardIdWidthOn16 = dotProp.get(data.cards,listOfCardIds[i]+'.widthOn16')
    //   totalWidthOn16 = totalWidthOn16 + cardIdWidthOn16;
    // }
    // //on rallonge la dernière card de la start line
    // let IdOfLastCard = listOfCardIds[listOfCardIds.length-1];
    // let formerWidthOn16 = dotProp.get(data.cards,IdOfLastCard+'.widthOn16');
    // let newData = dotProp.set(data,'cards.'+IdOfLastCard+'.widthOn16',formerWidthOn16+16-totalWidthOn16)
    // return newData;
    return data;
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
                  return <LineResize key={line.id} line={line} cards={cards}/>;
                  }
              })}
              {/*** EMPTY LINE ***/}
              {this.state.mode!=='resize' ? <Line line={{id:'lineEmpty'}} cards={[]}/>
            : <LineResize line={{id:'lineEmpty'}} cards={[]}/>}
            </ContainerLines>

            <ContainerSpe>
              <button type='button' onClick={()=>{
                  if (this.state.mode==='resize') {
                    this.setState({mode:'dnd'});
                  } else this.setState({mode:'resize'});
                }}
              >
                switch mode
              </button>

              {/***  NEW BLOCK  ***/}
              <Droppable droppableId={'speContainer'} direction="vertical">
                {(provided, snapshot) => (
                  <ContainerSpe2
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={snapshot.isDraggingOver}
                  >
                  {/*** NEW CARD ***/}
                    <Draggable draggableId={'newCard'} index={0}>
                      {(provided, snapshot) => (
                        <ContainerCard
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          isDragging={snapshot.isDragging}
                          widthOn16={2}
                        >
                          new card<br/>
                          l=2
                        </ContainerCard>
                      )}
                    </Draggable>
                    {provided.placeholder}

                  </ContainerSpe2>
                )}
              </Droppable>

            </ContainerSpe>

          </div>
        </DragDropContext>
    )
  }
}
ReactDOM.render(<App />, document.getElementById('root'));
