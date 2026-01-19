import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { GiphyResponse } from '../interfaces/giphy.interface';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';
import TrendingPage from '../pages/trending-page/trending-page';

const GIF_KEY = 'gifs'

const loadFromLocalStorage = () => {
  const gifsFromLocalStorage = localStorage.getItem(GIF_KEY) ?? '{}';
  const gifs = JSON.parse( gifsFromLocalStorage);

  return gifs;
}



@Injectable({providedIn: 'root'})
export class GifsService {

  trendingGifs = signal<Gif[]>([]);
  private trendingPage = signal(0);
  trendingGifsLoading = signal<boolean>(false);

  searchHistory = signal<Record<string,Gif[]>>(loadFromLocalStorage())
  searchHistoryKeys = computed( ()=> Object.keys(this.searchHistory()))

  saveGifsToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem('gifs',historyString);
  })

  trendingGifGroup = computed<Gif[][]>( () => {
    const groups = [];
    for ( let i = 0; i < this.trendingGifs().length; i += 3){
      groups.push( this.trendingGifs().slice(i, i+3));
    }
    return groups; //[[gif1,gif2,gif3],[gif4,gif5,gif6]]
  })



  private http = inject(HttpClient);

  constructor() {
    this.loadTrendingGifs();
    console.log('Petición a la API');
  }

  loadTrendingGifs(){
    if (this.trendingGifsLoading()) return;

    this.trendingGifsLoading.set(true);

    this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`,
      {
        params:{
          api_key: environment.giphyApiKey,
          limit: 20,
          offset: this.trendingPage() * 20,
        }

      }
    ).subscribe( (resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      this.trendingGifs.update( (currentGifs)=>[...currentGifs,...gifs]);
      this.trendingPage.update( (page) => page + 1);
      this.trendingGifsLoading.set(false);
    })
  }


  searchGifs(query: string){
    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`,
      {
        params:{
          api_key: environment.giphyApiKey,
          limit: 25,
          q: query,
        }

      }
    ).pipe(
      map( ({data})=> data),
      map( (items) => GifMapper.mapGiphyItemsToGifArray(items)),
      //alternativa
      // map ( ({data}) => GifMapper.mapGiphyItemsToGifArray(data))

      tap( (items) => {
        this.searchHistory.update( (history) => ({
          ...history,
          [query.toLocaleLowerCase()]:items,
        }))
      }),
    )
  }

  getHistoryGifs( query: string ): Gif[]{
    return this.searchHistory()[query] ?? [];
  }

}
