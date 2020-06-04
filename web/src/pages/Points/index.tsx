import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

interface Item {
  id:number;
  titulo: string;
  image_url: string;
}

interface UF {
  sigla: string
}

interface CityResponse {
  nome: string
}

const Point = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [UFs, setUfs] = useState<string[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCidade, setSelectedCidade] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
  const [selectedItens, setSelectedItens] = useState<number[]>([]);
  const history = useHistory();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp:''
  });

  useEffect(() => {
    api.get('itens').then(response => {
      setItens(response.data);
    })
  }, []);

  useEffect(() => {
    axios.get<UF[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    })
  }, []);

  useEffect(() => {
    if (selectedUF === '0')
      return;

    axios.get<CityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then(response => {
        const cidades = response.data.map(cidade => cidade.nome);
        setCidades(cidades);
      });  
  }, [selectedUF]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, [])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setSelectedUF(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    const cidade = event.target.value;
    setSelectedCidade(cidade);
  }

  function handleMapClick(event: LeafletMouseEvent ){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const { name, value } = event.target;

    setFormData({...formData, [name]: value})
  }

  function handleSelectItem(id: number) {
    const jaSelecionados = selectedItens.findIndex(item => item === id);

    if (jaSelecionados >= 0){
      const itensFiltrados = selectedItens.filter(item => item !== id);
      setSelectedItens(itensFiltrados);
    } else {
      setSelectedItens([...selectedItens, id]);
    }
  }

  async function save (event: FormEvent){
    event.preventDefault();

    const { nome, email, whatsapp} = formData;
    const uf = selectedUF;
    const cidade = selectedCidade;
    const [latitude, longitute] = selectedPosition;
    const itens = selectedItens;

    const data = {
      name: nome,
      email,
      whatsapp,
      uf,
      city: cidade,
      latitude,
      longitute,
      itens
    }

    await api.post('points', data);

    alert("Criado com sucesso!");
    
    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={save}> 
        <h1>Cadastro do <br/> ponto de coleta </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="nome">Nome da Entidade</label>
            <input
              type="text"
              name="nome"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
              type="email"
              name="email"
              id="email" 
              onChange={handleInputChange}
            />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
              type="text"
              name="whatsapp"
              id="whatsapp" 
              onChange={handleInputChange}
            />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={18} onclick={handleMapClick}>
            <TileLayer 
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {
                  UFs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))
                }
              </select>  
            </div>
            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <select name="cidade" id="cidade" onChange={handleSelectCity}>
                <option value={selectedCidade}>Selecione uma cidade</option>
                {
                  cidades.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))
                }
              </select>  
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            { itens.map(item => (
              <li 
                onClick={() => handleSelectItem(item.id)} 
                key={item.id}
                className={selectedItens.includes(item.id) ? 'selected' : ''}>
                <img src={item.image_url} alt={item.titulo}/>
                <span>{item.titulo}</span>
              </li>  
            ))}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}

export default Point;