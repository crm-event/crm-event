<?php

namespace App\Enums;

/**
 * How an appointment takes place.
 */
enum AppointmentMode: string
{
    case InPerson = 'in_person';
    case Video = 'video';
    case Phone = 'phone';
}
