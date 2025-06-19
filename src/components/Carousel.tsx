'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'

export default function Carousel() {
  return (
    <Swiper
      loop
      pagination={{ clickable: true }}
      navigation
      autoplay={{ delay: 9000 }}
      modules={[Pagination, Navigation, Autoplay]}
      className="h-60 w-full"
      speed={1000}
    >
      <SwiperSlide>
        <div className="bg-blue-200 h-full flex items-center justify-center rounded-md shadow">
          Slide 1
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="bg-green-200 h-full flex items-center justify-center rounded-md shadow">
          Slide 2
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="bg-red-200 h-full flex items-center justify-center rounded-md shadow">
          Slide 3
        </div>
      </SwiperSlide>
    </Swiper>
  )
}
