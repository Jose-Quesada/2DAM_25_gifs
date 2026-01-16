import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs';
import { GifsService } from '../../services/gifs.service';
import { GifsList } from '../../components/gifs-list/gifs-list';

@Component({
  selector: 'gifs-history-page',
  imports: [GifsList],
  templateUrl: './history-page.html',

})
export default class HistoryPage {

  gifsService = inject (GifsService);

  query = toSignal (inject(ActivatedRoute).params
  .pipe(map((params) => params['query']))
  // .subscribe(
    // params => { console.log(params['query'])}
  // )
  )

  gifsByKey = computed( () => {
    return this.gifsService.getHistoryGifs(this.query())
  })



}
