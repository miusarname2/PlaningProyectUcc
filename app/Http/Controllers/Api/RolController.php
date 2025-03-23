<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;

class RolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Rol::all();
        return response()->json($roles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre'=> 'required|string|max:50',
            'descripcion'=> 'required|string'
        ]);

        $rol = Rol::create($validateData);
        return response()->json($rol,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rol = Rol::findOrFail($id);
        return response()->json($rol);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rol = Rol::findOrFail($id);

        $validateData = $request->validate([
            'nombre' => 'sometimes|required|string|max:50',
            'descripcion'=> 'sometimes|required|string'
        ]);

        $rol->update($validateData);
        return response()->json($rol);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $rol = Rol::findOrFail($id);
        $rol->delete();
        return response()->json(['Message'=>'Role successfully eliminated','status'=>200],200);
    }
}
