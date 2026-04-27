package com.example.railway_congestion.service;

import com.example.railway_congestion.dto.CongestionResponse;
import com.example.railway_congestion.model.Reservation;
import com.example.railway_congestion.model.Station;
import com.example.railway_congestion.model.Train;
import com.example.railway_congestion.repository.ReservationRepository;
import com.example.railway_congestion.repository.StationRepository;
import com.example.railway_congestion.repository.TrainRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CongestionService {

    private final ReservationRepository reservationRepository;
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;

    public CongestionService(ReservationRepository reservationRepository,
                             TrainRepository trainRepository,
                             StationRepository stationRepository) {
        this.reservationRepository = reservationRepository;
        this.trainRepository = trainRepository;
        this.stationRepository = stationRepository;
    }

    /**
     * Look up congestion by PNR number.
     * Finds the reservation, then calculates station-level congestion.
     */
    public CongestionResponse getStatusByPnr(String pnr) {
        Reservation reservation = reservationRepository.findByPnrNumber(pnr);
        if (reservation == null) {
            return null;
        }

        Train train = reservation.getTrain();
        if (train == null) {
            return null;
        }

        int stationId = train.getStationId();
        Optional<Station> stationOpt = stationRepository.findById(stationId);

        // Calculate total passengers at this station across all trains
        List<Train> trainsAtStation = trainRepository.findByStationId(stationId);
        int totalPassengers = 0;
        for (Train t : trainsAtStation) {
            Integer passengers = reservationRepository.getTotalPassengers(t.getTrainId());
            if (passengers != null) {
                totalPassengers += passengers;
            }
        }

        String level = calculateCongestionLevel(totalPassengers);

        return CongestionResponse.builder()
                .congestionLevel(level)
                .totalPassengers(totalPassengers)
                .stationName(stationOpt.map(Station::getStationName).orElse("Unknown"))
                .city(stationOpt.map(Station::getCity).orElse("Unknown"))
                .trainName(train.getTrainName())
                .departureTime(train.getDepartureTime())
                .platform(train.getPlatform())
                .pnr(pnr)
                .journeyDate(reservation.getJourneyDate())
                .stationId(stationId)
                .trainId(train.getTrainId())
                .build();
    }

    /**
     * Get congestion for a specific station on a specific date.
     */
    public CongestionResponse getCongestionByStationAndDate(int stationId, String date) {
        Optional<Station> stationOpt = stationRepository.findById(stationId);
        if (stationOpt.isEmpty()) {
            return null;
        }

        Station station = stationOpt.get();
        Integer totalPassengers = reservationRepository.getTotalPassengersByStationAndDate(stationId, date);
        int passengers = (totalPassengers != null) ? totalPassengers : 0;
        String level = calculateCongestionLevel(passengers);

        return CongestionResponse.builder()
                .congestionLevel(level)
                .totalPassengers(passengers)
                .stationName(station.getStationName())
                .city(station.getCity())
                .journeyDate(date)
                .stationId(stationId)
                .build();
    }

    /**
     * Congestion thresholds:
     * < 500 = LOW
     * 500 - 1500 = MEDIUM
     * > 1500 = HIGH
     */
    public String calculateCongestionLevel(int passengers) {
        if (passengers < 500) {
            return "LOW";
        } else if (passengers <= 1500) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }
}