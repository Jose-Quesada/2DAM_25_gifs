import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { GiphyResponse } from '../interfaces/giphy.interface';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GifsService {

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal<boolean>(true);

  searchHistory = signal<Record<string, Gif[]>>({})
  searchHistoryKeys = computed( ()=> Object.keys(this.searchHistory()))



  private http = inject(HttpClient);

  constructor() {
    this.loadTrendingGifs();
    console.log('Petición a la API');
  }

  loadTrendingGifs(){
    this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`,
      {
        params:{
          api_key: environment.giphyApiKey,
          limit: 25,
        }

      }
    ).subscribe( (resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      this.trendingGifs.set(gifs);
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
