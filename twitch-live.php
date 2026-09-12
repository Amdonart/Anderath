<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60, stale-while-revalidate=120');

$streamers = [
    'amdonlive', 'joymcraven', 'bekkachuu', 'bunadiluna',
    'dantedarkknight84', 'kaikotheunicorn', 'iamedvir', 'schmenta',
    'jennini84', 'ledoeh', 'kyxbi', 'holy_aggu',
    'unknownartdemon', 'lil_janie', 'xschellie', 'angelic_infection',
    'x_reona_x', 'schnutnut', 'bubblegumfoxy', 'pixelmind_',
    'teslaynee', 'arctilupus', 'itsshyly', 'fliesent1sch_', 'seyphiiir'
];

$clientId = getenv('TWITCH_CLIENT_ID') ?: '';
$clientSecret = getenv('TWITCH_CLIENT_SECRET') ?: '';

if ($clientId === '' || $clientSecret === '') {
    http_response_code(503);
    echo json_encode(['error' => 'not_configured']);
    exit;
}

function requestJson(string $url, string $method = 'GET', array $headers = [], string $body = ''): array
{
    $context = stream_context_create(['http' => [
        'method' => $method,
        'header' => implode("\r\n", $headers),
        'content' => $body,
        'ignore_errors' => true,
        'timeout' => 8,
    ]]);
    $response = @file_get_contents($url, false, $context);
    $status = $http_response_header[0] ?? '';
    if ($response === false || !preg_match('/\s2\d\d\s/', $status)) {
        throw new RuntimeException('Twitch request failed');
    }
    return json_decode($response, true, 512, JSON_THROW_ON_ERROR);
}

try {
    $tokenCacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'anderath-twitch-' . hash('sha256', $clientId) . '.json';
    $tokenCache = is_file($tokenCacheFile) ? json_decode((string) @file_get_contents($tokenCacheFile), true) : null;
    $token = is_array($tokenCache) && ($tokenCache['expires_at'] ?? 0) > time() + 60
        ? (string) ($tokenCache['access_token'] ?? '')
        : '';

    if ($token === '') {
        $tokenResponse = requestJson(
            'https://id.twitch.tv/oauth2/token',
            'POST',
            ['Content-Type: application/x-www-form-urlencoded'],
            http_build_query([
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'grant_type' => 'client_credentials',
            ])
        );
        $token = $tokenResponse['access_token'] ?? '';
        @file_put_contents($tokenCacheFile, json_encode([
            'access_token' => $token,
            'expires_at' => time() + (int) ($tokenResponse['expires_in'] ?? 0),
        ]), LOCK_EX);
    }
    if ($token === '') {
        throw new RuntimeException('No Twitch token');
    }

    $query = implode('&', array_map(static fn(string $login): string => 'user_login=' . rawurlencode($login), $streamers));
    $streamsResponse = requestJson(
        'https://api.twitch.tv/helix/streams?' . $query,
        'GET',
        ['Client-Id: ' . $clientId, 'Authorization: Bearer ' . $token]
    );

    $liveStreams = array_values(array_filter($streamsResponse['data'] ?? [], static function (array $stream): bool {
        return str_starts_with(strtolower(ltrim($stream['title'] ?? '')), 'anderath|');
    }));

    usort($liveStreams, static function (array $left, array $right): int {
        $leftPriority = strtolower($left['user_login'] ?? '') === 'amdonlive' ? 0 : 1;
        $rightPriority = strtolower($right['user_login'] ?? '') === 'amdonlive' ? 0 : 1;
        return $leftPriority <=> $rightPriority;
    });

    $result = array_map(static function (array $stream): array {
        return [
            'name' => $stream['user_name'],
            'login' => $stream['user_login'],
            'title' => $stream['title'],
            'game' => $stream['game_name'],
            'viewers' => $stream['viewer_count'],
            'startedAt' => $stream['started_at'],
            'thumbnail' => str_replace(['{width}', '{height}'], ['640', '360'], $stream['thumbnail_url']),
            'url' => 'https://twitch.tv/' . rawurlencode($stream['user_login']),
        ];
    }, $liveStreams);

    echo json_encode(['streams' => $result], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    http_response_code(502);
    echo json_encode(['error' => 'twitch_unavailable']);
}
