import * as React from 'react';
import './App.css';
import { Tab, Image, Divider, Checkbox, Button, Modal, Radio, Dropdown, Input, Label } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import pokemonsData from './pokemons';
import categoriesData from './cates';
import * as _ from 'lodash';

import * as server from './server';


interface IAppProps {
};

interface IAppStates {
  isSaving?: boolean;
  pokemonsData?: any;
  categoriesData?: any;
  slectedPOkemons?: number[],
  slectedCategory?: string,
  categoeyNameInput?: string,
  slectedRadioType?: number,
  showAddNewModal?: boolean
}

export default class App extends React.Component<IAppProps, IAppStates> {

  constructor(props: IAppProps) {
    super(props);
    this.state = {
      isSaving: false,
      pokemonsData: pokemonsData,
      categoriesData: categoriesData,
      slectedPOkemons: [],
      showAddNewModal: false
    };

    this.onSelectPokemon = this.onSelectPokemon.bind(this);
    this.onSelectRadio = this.onSelectRadio.bind(this);
    this.handleDropDownChange = this.handleDropDownChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSave = this.handleSave.bind(this);

  }

  getList(data: any) {
    let pokemons = this.state.pokemonsData
    if (data != 'all') {
      let found: any =
        pokemons = _.filter(pokemons, function (p) {
          return _.includes(data, p.id)
        });
    }


    return (
      _.map(pokemons, (item, index) => {
        return (
          <li key={index}>
            <Checkbox
              value={item.id}
              onChange={this.onSelectPokemon.bind(this)}
            />
            <Image src={item.ThumbnailImage} size='tiny' verticalAlign='middle' circular className="p_img" />
            <div className='p_name_sec'>
              <div className="p_name">{item.name}</div>
              <div className='p_tags'>
                {
                  _.map(item.abilities, (typ) => {

                    return (
                      <Label as='a' content={typ} size='tiny' />
                    )
                  })
                }
              </div>
            </div>


            <div className='ui grid p_sub_sec'>
              <div className='two wide column'>
                <p><b>Abilities</b></p>
                {
                  _.map(item.abilities, (ability) => {

                    return (
                      <p>{ability}</p>
                    )
                  })
                }
              </div>
              <div className='two wide column'>
                <p><b>Weakness</b></p>
                {
                  _.map(item.weakness, (weaknes) => {

                    return (
                      <p>{weaknes}</p>
                    )
                  })
                }
              </div>
            </div>

            <Divider />
          </li >
        )
      })
    )
  }

  onSelectPokemon(e: any, data: any) {
    const isChecked = data.checked;
    const value = data.value;
    let checked = this.state.slectedPOkemons as number[];

    if (isChecked) {
      checked.push(value);
    } else {
      checked = _.filter(checked, function (c) {
        return c != value
      });
    }

    this.setState({ slectedPOkemons: checked });
  }

  onSelectRadio(e: any, data: any) {
    const value = data.value;
    this.setState({ slectedRadioType: value })
  }

  handleDropDownChange(e: any, data: any) {
    const value = data.value;
    this.setState({ slectedCategory: value })
  }

  handleInputChange(e: any, data: any) {
    const value = data.value;
    this.setState({ categoeyNameInput: value })
  }

  handleSave() {
    this.setState({ isSaving: true });
    const type = this.state.slectedRadioType;
    const items = this.state.slectedPOkemons;
    if (type == 1) {
      const selectedCategory = this.state.slectedCategory;
      const data = { items: items, categoryName: selectedCategory }
      server.post('/addToCategory', data)
        .then((res) => {
          this.setState({ isSaving: false, showAddNewModal: false });
        })
        .catch((error) => {
          this.setState({ isSaving: false, showAddNewModal: false });
        })
    } else {
      const categoryName = this.state.categoeyNameInput;
      const data = { categoryName: categoryName, items: items }
      server.post('/createNewCategory', data)
        .then((res) => {
          this.setState({ isSaving: false, showAddNewModal: false });
        })
        .catch((error) => {
          this.setState({ isSaving: false, showAddNewModal: false });
        })
    }
  }

  catgeroyActions() {
    return (
      <div className='ui grid'>
        <div className='two wide column'><a>Reorder</a></div>
        <div className='two wide column'><a style={{ color: 'red' }}>Delete category</a></div>
      </div>
    )
  }

  getPokemons() {
    return server.get('https://5n6ugc33m6.execute-api.us-east-1.amazonaws.com/api/pokedex')
      .then(res => {
        return this.state.pokemonsData;
        // return res;
      });
  }

  getCategories() {
    return server.get('https://5n6ugc33m6.execute-api.us-east-1.amazonaws.com/api/pokedex')
      .then(res => {
        return this.state.categoriesData;
        // return res;
      });
  }

  showAddNewModal() {
    if (this.state.slectedPOkemons!.length == 0) {
      alert("Please select atleast one pokemon")
    } else {
      this.setState({
        showAddNewModal: true
      })
    }

  }

  closeAddNewModal() {
    this.setState({
      showAddNewModal: false
    })
  }

  componentDidMount() {

    Promise
      .all([
        this.getPokemons(),
        this.getCategories()

      ])
      .then(([pokemonsResponse, categoriesResponse]) => {

        this.setState({
          pokemonsData: pokemonsResponse,
          categoriesData: categoriesResponse
        })

      })
      .catch((error) => {
        console.log('api failed');
      });

  }


  getTabPanes() {
    const categories = this.state.categoriesData.data.new;
    let panes: any = [];
    panes.push({ menuItem: 'All', render: () => <Tab.Pane><ul>{this.getList('all')}</ul> </Tab.Pane> })
    _.map(categories, (category) => {
      panes.push({ menuItem: category, render: () => <Tab.Pane><ul>{this.getList(category.items)}</ul> </Tab.Pane> })
    })

    return panes;

  }



  categoryOptions() {
    const categories = this.state.categoriesData.data.new
    let categoryOptions: any = [];
    _.map(categories, (category) => {
      categoryOptions.push({
        key: category.name,
        text: category.name,
        value: category.name
      })
    })

    return categoryOptions;
  }


  render() {

    const panes = this.getTabPanes();
    const categoryOptions = this.categoryOptions();

    return (
      <div className="App" >
        <Image src='https://cdn.bulbagarden.net/upload/thumb/4/4b/Pok%C3%A9dex_logo.png/250px-Pok%C3%A9dex_logo.png'
          size='small'
          centered />
        <div className='ui grid centered' >
          <div className='ten wide column tabs' >
            <Tab panes={panes} />
          </div>
        </div>
        <div className="p_add_btn">
          <Button className='btn' size='large' onClick={this.showAddNewModal.bind(this)}>Add to category</Button>
        </div>

        {/* {this.state.showAddNewModal && */}
        <Modal size='small' open={this.state.showAddNewModal}>
          <Modal.Content>
            <div className='ui grid centered'>
              <div className='sixteen wide column p_action_modal_sec'>
                <Radio
                  label='Select an existing category'
                  className='p_select_radio'
                  value={1}
                  name='radioGroup'
                  onChange={this.onSelectRadio.bind(this)} />
                <Dropdown
                  placeholder='Select Friend'
                  fluid
                  selection
                  options={categoryOptions}
                  onChange={this.handleDropDownChange.bind(this)}
                />
              </div>
              <div className='sixteen wide column p_action_modal_sec'>
                <Radio
                  label='Or create a new category'
                  className='p_select_radio'
                  value={2}
                  name='radioGroup'
                  onChange={this.onSelectRadio.bind(this)} />
                <Input
                  placeholder='Category name...'
                  className='p_input'
                  onChange={this.handleInputChange.bind(this)} />
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button
              className='btn'
              size='medium'
              loading={this.state.isSaving}
              onClick={this.handleSave.bind(this)}>
              Save
                  </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}
