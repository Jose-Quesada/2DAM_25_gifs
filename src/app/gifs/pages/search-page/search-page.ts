import { Component, inject, signal } from '@angular/core';
import { GifsList } from '../../components/gifs-list/gifs-list';
import { GifsService } from '../../services/gifs.service';
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'gifs-search-page',
  imports: [GifsList],
  templateUrl: './search-page.html',
})
export default class SearchPage {

  gifsService = inject( GifsService);
  gifs = signal<Gif[]>([]);

   onSearch( query: string){
    this.gifsService.searchGifs(query).subscribe((resp)=>{
      this.gifs.set(resp);
    })
  }
}
