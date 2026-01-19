import {  AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { GifsList } from '../../components/gifs-list/gifs-list';
import { GifsService } from '../../services/gifs.service';
import { ScrollStateService } from '../../services/scroll-state.service';

@Component({
  selector: 'gifs-trending-page',
  imports: [GifsList],
  templateUrl: './trending-page.html',
})
export default class TrendingPage implements AfterViewInit{


  // gifs = signal(imageUrls);

  gifsService = inject (GifsService);
  scrollStateService = inject (ScrollStateService);


  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');


  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if ( !scrollDiv )return;

    scrollDiv.scrollTop = this.scrollStateService.trendingScrollState();

  }

  onScroll(event: Event) {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
     if ( !scrollDiv )return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
    const scroolHeight = scrollDiv.scrollHeight;

    const isAtBottom = scrollTop + clientHeight + 300 >= scroolHeight
    this.scrollStateService.trendingScrollState.set(scrollTop);
    if (isAtBottom){
      this.gifsService.loadTrendingGifs();
    }

  }
}


