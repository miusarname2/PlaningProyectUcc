<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Utilizamos with() para cargar las relaciones de usuario e implemento
        $reservas = Reserva::with(['usuario', 'implemento'])->get();
        return response()->json($reservas, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'idUsuario'     => 'required|integer|exists:Usuario,idUsuario',
            'idImplemento'  => 'required|integer|exists:Implemento,idImplemento',
            'fecha'         => 'required|date',
            'hora'          => 'required|string', // Ajusta la validación si tienes un formato específico
            'estado'        => 'required|string|max:50', // O el tipo de validación que prefieras
        ]);

        $reserva = Reserva::create($validateData);

        return response()->json($reserva, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $reserva = Reserva::with(['usuario', 'implemento'])->findOrFail($id);
        return response()->json($reserva, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $reserva = Reserva::findOrFail($id);

        $validateData = $request->validate([
            'idUsuario'     => 'sometimes|required|integer|exists:Usuario,idUsuario',
            'idImplemento'  => 'sometimes|required|integer|exists:Implemento,idImplemento',
            'fecha'         => 'sometimes|required|date',
            'hora'          => 'sometimes|required|string',
            'estado'        => 'sometimes|required|string|max:50',
        ]);

        $reserva->update($validateData);

        return response()->json($reserva);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $reserva = Reserva::findOrFail($id);
        $reserva->delete();

        return response()->json(['Message'=>'Reserva successfully eliminated','status'=>200]);
    }
}
