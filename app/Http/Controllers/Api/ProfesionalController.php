<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profesional;
use Illuminate\Http\Request;

class ProfesionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profesional = Profesional::with("especialidades")->get();
        return response()->json($profesional);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'codigo'=> "required|string|max:100",
            'nombreCompleto'=> "required|string|max:100",
            'email'=>"required|email|unique:profesional,email",
            'titulo'=> "required|string|max:200",
            'experiencia'=> "required|integer",
            'estado'=> "required|string",
            'perfil'=> "nullable|string",
            'especialidades'=> "nullable|array",
            'especialidades.*' => 'integer|exists:especialidades,idEspecialidad'
        ]);

        $profesional = Profesional::create($validatedData);

        if ($request->has('especialidades')) {
            $profesional->especialidades()->sync($validatedData['especialidades']);
        }

        $profesional->load('especialidades');

        return response()->json($profesional,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $profesional = Profesional::with("especialidades")->findOrFail($id);
        return response()->json($profesional);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $profesional = Profesional::findOrFail($id);

        $validatedData = $request->validate(
            [
                'codigo'         => 'sometimes|required|string|max:255',
                'nombreCompleto' => 'sometimes|required|string|max:255',
                'email'          => 'sometimes|required|email|unique:profesionales,email,'.$id.',idProfesional',
                'titulo'         => 'sometimes|required|string|max:255',
                'experiencia'    => 'sometimes|required|integer',
                'estado'         => 'sometimes|required|string',
                'perfil'         => 'sometimes|nullable|string',
                'especialidades' => 'sometimes|nullable|array',
                'especialidades.*' => 'integer|exists:especialidades,idEspecialidad'
            ]
        );

        $profesional->update($validatedData);

        if ($request->has('especialidades')) {
            $profesional->especialidades()->sync($validatedData['especialidades']);
        }

        $profesional->load('especialidades');

        return response()->json($profesional,0);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $profesional = Profesional::findOrFail($id);
        $profesional->delete();

        return response()->json(["message"=> "profesional deleted"]);
    }
}
