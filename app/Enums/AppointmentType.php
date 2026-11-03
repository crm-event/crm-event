<?php

namespace App\Enums;

/**
 * Kind of appointment between the planner and a couple.
 */
enum AppointmentType: string
{
    case Discovery = 'discovery';
    case Milestone = 'milestone';
    case TechnicalVisit = 'technical_visit';
    case Other = 'other';
}
