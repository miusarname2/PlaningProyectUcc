<?php

namespace App\Http\Controllers;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
